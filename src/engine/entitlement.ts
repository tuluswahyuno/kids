"use client";

import { createPersistentStore } from "@/lib/store";

/**
 * Status berlangganan / pembelian.
 *
 * PENTING: nilai di localStorage hanya CACHE untuk tampilan. Sumber kebenaran
 * produksi harus dari server (lihat docs/MONETISASI.md):
 *   Play Billing / Stripe / Xendit  ->  RevenueCat webhook  ->  tabel `entitlements` di Supabase
 * lalu klien membaca tabel itu setelah login.
 */
export interface Entitlement {
  premium: boolean;
  source: "none" | "dev" | "play" | "web";
  /** epoch ms; null = tidak berakhir (beli sekali) */
  until: number | null;
}

export const entitlementStore = createPersistentStore<Entitlement>("mp.entitlement.v1", {
  premium: false,
  source: "none",
  until: null,
});

/**
 * MODE GRATIS: semua tingkat & game terbuka untuk semua orang, tanpa paywall.
 * Aktif secara bawaan. Untuk kembali ke model berbayar, set NEXT_PUBLIC_FREE_MODE=0 lalu build ulang.
 */
export const FREE_MODE = process.env.NEXT_PUBLIC_FREE_MODE !== "0";

export function isPremiumNow(e: Entitlement, now = Date.now()): boolean {
  if (FREE_MODE) return true;
  return e.premium && (e.until === null || e.until > now);
}

export function useEntitlement() {
  const e = entitlementStore.use();
  return { ...e, isPremium: isPremiumNow(e) };
}

/** Hanya untuk pengembangan. Di produksi diganti pembelian sungguhan. */
export const DEV_UNLOCK_ENABLED = process.env.NEXT_PUBLIC_DEV_UNLOCK === "1";

export function devSetPremium(on: boolean) {
  entitlementStore.set({ premium: on, source: on ? "dev" : "none", until: null });
}

export function applyServerEntitlement(e: Entitlement) {
  entitlementStore.set(e);
}
