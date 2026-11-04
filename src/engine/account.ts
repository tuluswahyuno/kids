"use client";

import { useSyncExternalStore } from "react";
import { getSupabase, isCloudConfigured } from "@/lib/supabase";
import {
  chunk,
  fromChildRow,
  fromSessionRow,
  mergeSessions,
  pendingSessions,
  toChildRow,
  toSessionRow,
  type ChildRow,
  type SessionRow,
} from "@/lib/sync";
import { entitlementStore } from "./entitlement";
import { profilesStore } from "./profiles";
import { progressStore } from "./progress";

/**
 * Akun ORANG TUA (bukan anak) + sinkronisasi. Opsional: tanpa login semua data tetap lokal.
 * Login memakai kode sekali pakai lewat email (tanpa kata sandi, tanpa tautan -> aman di aplikasi Android).
 */
export interface AccountState {
  status: "off" | "loading" | "signedout" | "signedin";
  email: string | null;
  busy: boolean;
  lastSync: number | null;
  message: string | null;
}

let state: AccountState = {
  status: isCloudConfigured() ? "loading" : "off",
  email: null,
  busy: false,
  lastSync: null,
  message: null,
};
const listeners = new Set<() => void>();
const set = (p: Partial<AccountState>) => {
  state = { ...state, ...p };
  listeners.forEach((l) => l());
};
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => void listeners.delete(fn);
};
const SERVER_STATE: AccountState = { status: "off", email: null, busy: false, lastSync: null, message: null };

export const useAccount = () => useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);

let started = false;
/** Panggil sekali di area orang tua. */
export function initAccount() {
  const sb = getSupabase();
  if (!sb || started) return;
  started = true;
  sb.auth.getSession().then(({ data }) => {
    set({ status: data.session ? "signedin" : "signedout", email: data.session?.user.email ?? null });
  });
  sb.auth.onAuthStateChange((_e, session) => {
    set({ status: session ? "signedin" : "signedout", email: session?.user.email ?? null });
  });
}

const fail = (e: unknown) => set({ busy: false, message: e instanceof Error ? e.message : "Terjadi kesalahan. Coba lagi." });

export async function sendCode(email: string) {
  const sb = getSupabase();
  if (!sb) return false;
  set({ busy: true, message: null });
  const { error } = await sb.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
  if (error) return fail(error), false;
  set({ busy: false, message: "Kode dikirim ke email. Masukkan kode untuk masuk." });
  return true;
}

export async function verifyCode(email: string, code: string) {
  const sb = getSupabase();
  if (!sb) return false;
  set({ busy: true, message: null });
  const { error } = await sb.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
  if (error) return fail(error), false;
  set({ busy: false, message: null });
  void syncNow();
  return true;
}

export async function signOut() {
  await getSupabase()?.auth.signOut();
  set({ message: null });
}

/** Kirim data lokal yang belum terkirim, tarik data server, lalu perbarui status premium dari server. */
export async function syncNow() {
  const sb = getSupabase();
  if (!sb || state.busy) return;
  set({ busy: true, message: null });
  try {
    const { data: u } = await sb.auth.getUser();
    const user = u.user;
    if (!user) throw new Error("Belum masuk.");

    // 1) anak (profil) -> server
    const { list } = profilesStore.get();
    if (list.length) {
      const { error } = await sb.from("children").upsert(list.map((p) => toChildRow(p, user.id)), { onConflict: "id" });
      if (error) throw error;
    }

    // 2) sesi belum terkirim -> server (idempoten: id dibuat di klien)
    const pending = pendingSessions(progressStore.get().sessions, list);
    const sentIds = new Set<string>();
    for (const part of chunk(pending, 200)) {
      const { error } = await sb.from("sessions").upsert(part.map(toSessionRow), { onConflict: "id", ignoreDuplicates: true });
      if (error) throw error;
      part.forEach((s) => sentIds.add(s.id));
    }
    if (sentIds.size) {
      progressStore.set((p) => ({ sessions: p.sessions.map((s) => (sentIds.has(s.id) ? { ...s, synced: true } : s)) }));
    }

    // 3) tarik dari server (perangkat baru / ganti perangkat)
    const [children, sessions] = await Promise.all([
      sb.from("children").select("id,parent_id,name,avatar"),
      sb.from("sessions").select("id,child_id,game_id,level_id,category,score,total,played_at").order("played_at", { ascending: false }).limit(1000),
    ]);
    if (children.error) throw children.error;
    if (sessions.error) throw sessions.error;
    profilesStore.set((s) => {
      const have = new Set(s.list.map((p) => p.id));
      const add = (children.data as ChildRow[]).filter((c) => !have.has(c.id)).map(fromChildRow);
      return add.length ? { ...s, list: [...s.list, ...add], activeId: s.activeId ?? add[0].id } : s;
    });
    progressStore.set((p) => ({ sessions: mergeSessions(p.sessions, (sessions.data as SessionRow[]).map(fromSessionRow)).slice(-1000) }));

    // 4) premium: SUMBER KEBENARAN = server (tabel entitlements, hanya bisa dibaca klien)
    const ent = await sb.from("entitlements").select("premium,source,until").maybeSingle();
    if (ent.error) throw ent.error;
    if (ent.data) {
      entitlementStore.set({
        premium: ent.data.premium,
        source: ent.data.source,
        until: ent.data.until ? Date.parse(ent.data.until) : null,
      });
    }
    set({ busy: false, lastSync: Date.now(), message: "Tersinkronisasi ✔" });
  } catch (e) {
    fail(e);
  }
}

/** Hapus akun + semua data di server (hak orang tua, UU PDP). Data lokal dibiarkan; pengguna menghapusnya sendiri. */
export async function deleteAccount() {
  const sb = getSupabase();
  if (!sb) return false;
  set({ busy: true, message: null });
  const { error } = await sb.rpc("delete_my_account");
  if (error) return fail(error), false;
  await sb.auth.signOut();
  set({ busy: false, message: "Akun dan data di server telah dihapus." });
  return true;
}
