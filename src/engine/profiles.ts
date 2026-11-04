"use client";

import { createPersistentStore } from "@/lib/store";

/**
 * Profil anak. SENGAJA minimal (nama panggilan + avatar) demi privasi anak:
 * tidak ada email, foto, tanggal lahir, atau lokasi.
 */
export interface Profile {
  id: string;
  name: string;
  avatar: string;
  createdAt: number;
}

interface ProfilesState {
  list: Profile[];
  activeId: string | null;
}

export const AVATARS = ["🦁", "🐼", "🐯", "🐰", "🦊", "🐸", "🐧", "🦄", "🐳", "🐙", "🦋", "🐢"];

export const profilesStore = createPersistentStore<ProfilesState>("mp.profiles.v1", {
  list: [],
  activeId: null,
});

export const useProfiles = () => profilesStore.use();

export function activeProfile(s: ProfilesState): Profile | null {
  return s.list.find((p) => p.id === s.activeId) ?? s.list[0] ?? null;
}

const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now() + Math.random()));

export function addProfile(name: string, avatar: string): Profile {
  const p: Profile = { id: uid(), name: name.trim().slice(0, 20) || "Anak", avatar, createdAt: Date.now() };
  profilesStore.set((s) => ({ list: [...s.list, p], activeId: p.id }));
  return p;
}

export function selectProfile(id: string) {
  profilesStore.set((s) => ({ ...s, activeId: id }));
}

export function removeProfile(id: string) {
  profilesStore.set((s) => {
    const list = s.list.filter((p) => p.id !== id);
    return { list, activeId: s.activeId === id ? (list[0]?.id ?? null) : s.activeId };
  });
}
