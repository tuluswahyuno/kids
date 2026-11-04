import { applyServerEntitlement, DEV_UNLOCK_ENABLED, devSetPremium, type Entitlement } from "@/engine/entitlement";

/**
 * Lapisan pembayaran. UI hanya bicara dengan `getBilling()`, jadi penyedia
 * pembayaran bisa diganti tanpa menyentuh UI:
 *
 *   Android (Play Store)  -> Google Play Billing, lewat RevenueCat (@revenuecat/purchases-capacitor)
 *   Web                   -> Stripe Checkout / Xendit / Midtrans (kartu, QRIS, e-wallet)
 *   Sumber kebenaran      -> tabel `entitlements` di Supabase (diisi webhook), bukan localStorage
 *
 * Aturan Play Store: konten digital di dalam aplikasi Android WAJIB memakai Play Billing.
 * Jangan arahkan pengguna Android ke pembayaran web untuk membuka konten.
 */

export interface Plan {
  id: string;
  name: string;
  /** contoh harga — ganti dengan harga sebenarnya (idealnya dari RevenueCat Offerings) */
  priceLabel: string;
  period: string;
  badge?: string;
}

export const PLANS: Plan[] = [
  { id: "bulanan", name: "Bulanan", priceLabel: "Rp 29.000", period: "per bulan" },
  { id: "tahunan", name: "Tahunan", priceLabel: "Rp 249.000", period: "per tahun", badge: "Paling hemat" },
  { id: "seumur-hidup", name: "Sekali bayar", priceLabel: "Rp 399.000", period: "selamanya" },
];

export type PurchaseResult =
  | { ok: true; entitlement: Entitlement }
  | { ok: false; reason: "unconfigured" | "cancelled" | "error"; message: string };

export interface BillingProvider {
  readonly name: string;
  purchase(planId: string): Promise<PurchaseResult>;
  /** Wajib ada di tampilan: "Pulihkan pembelian" (syarat App Store / Play Store). */
  restore(): Promise<PurchaseResult>;
}

/** Penyedia bawaan: belum terhubung ke pembayaran sungguhan. */
const unconfigured: BillingProvider = {
  name: "belum-dikonfigurasi",
  async purchase(planId) {
    if (DEV_UNLOCK_ENABLED) {
      devSetPremium(true);
      return { ok: true, entitlement: { premium: true, source: "dev", until: null } };
    }
    return {
      ok: false,
      reason: "unconfigured",
      message: `Pembayaran belum diaktifkan (paket: ${planId}). Hubungkan RevenueCat / Stripe lebih dulu — lihat docs/MONETISASI.md.`,
    };
  },
  async restore() {
    return { ok: false, reason: "unconfigured", message: "Belum ada pembelian yang bisa dipulihkan." };
  },
};

let provider: BillingProvider = unconfigured;

/** Dipanggil saat startup setelah penyedia sungguhan siap (mis. RevenueCat). */
export function registerBilling(p: BillingProvider) {
  provider = p;
}

export const getBilling = () => provider;

/** Terapkan hasil dari server (webhook -> Supabase) ke cache lokal. */
export function syncEntitlementFromServer(e: Entitlement) {
  applyServerEntitlement(e);
}
