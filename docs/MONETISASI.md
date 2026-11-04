# Monetisasi

## Model yang disarankan: **Freemium + langganan/sekali bayar**

- **Gratis:** semua game, tingkat Mudah & Sedang. Orang tua bisa menilai kualitas tanpa bayar.
- **Premium:** tingkat Sulit/Ahli, game baru berkala, laporan perkembangan, tema tambahan.
- Tanpa iklan. Iklan di aplikasi anak = risiko kebijakan tinggi + merusak kepercayaan.

Di kode, kunci premium cukup `premium: true` pada `Level` di definisi game.

## Aturan yang harus dipatuhi

| Platform | Aturan |
|---|---|
| **Play Store** | Konten digital WAJIB lewat **Google Play Billing**. Jangan arahkan pengguna Android ke bayar-web. Komisi 15% (langganan & usaha kecil). |
| **Program "Designed for Families"** | Aplikasi anak: tanpa iklan yang tidak sesuai usia, tanpa pelacak/ID iklan, gerbang orang tua sebelum pembelian & tautan keluar, kebijakan privasi, formulir Data Safety jujur. |
| **Pembelian** | Anak tidak boleh bisa membeli sendiri → `ParentGate` (soal perkalian) sudah dipasang di `/orang-tua/*`. |
| **Wajib ada** | Tombol **Pulihkan pembelian**, harga jelas, cara membatalkan. |

## Alur pembelian (target akhir)

```
Android:  Play Billing ──► RevenueCat ──webhook──► Supabase.entitlements ──► klien membaca
Web:      Stripe/Xendit/Midtrans ──webhook──► Supabase.entitlements ──► klien membaca
```

Klien **tidak pernah** memutuskan sendiri status premium; ia hanya membaca tabel `entitlements`
(RLS: hanya baca). `localStorage` hanyalah cache tampilan.

## Yang sudah ada di kode

- `src/lib/billing.ts` — antarmuka `BillingProvider` (`purchase`, `restore`) + daftar paket contoh.
- `src/engine/entitlement.ts` — cache status premium + `NEXT_PUBLIC_DEV_UNLOCK` untuk uji tanpa bayar.
- `src/engine/Paywall.tsx` & `src/components/PremiumView.tsx` — UI.
- `supabase/schema.sql` — tabel `entitlements` dengan RLS tanpa policy tulis.

## Yang perlu Anda siapkan

1. Akun **Google Play Console** (biaya sekali US$25) + profil pembayaran/merchant.
2. Akun **RevenueCat** (gratis sampai pendapatan tertentu): buat produk langganan di Play Console, hubungkan.
3. Endpoint webhook (Supabase Edge Function) yang menulis `entitlements` saat ada event RevenueCat.
4. Untuk web: Stripe (kartu) atau Xendit/Midtrans (QRIS, e-wallet, VA — lebih cocok untuk Indonesia).
5. Badan usaha/NPWP sesuai kebutuhan pajak (PPN produk digital, PPh). **Konsultasikan dengan akuntan.**

## Harga (saran awal untuk diuji)

Paket di `billing.ts` hanyalah contoh. Mulai dari satu paket tahunan + bulanan, uji A/B, dan
sediakan uji coba gratis 7 hari lewat Play Billing.
