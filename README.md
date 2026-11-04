# Main Pintar

Game belajar untuk anak TK (4–7 tahun): membaca, berhitung, dan mengingat. Tanpa iklan.
Satu kode untuk **web**, **PWA**, dan **Android (Play Store)**.

**Stack:** Next.js 16 (static export) · React 19 · TypeScript · Vitest · (tahap 3) Supabase · (tahap 4) Capacitor + RevenueCat

## Menjalankan

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # tes logika game & konten
npm run typecheck
npm run lint
npm run build        # -> folder out/ (static export, siap di-hosting)
```

Uji kunci premium tanpa bayar: salin `.env.example` ke `.env.local`, set `NEXT_PUBLIC_DEV_UNLOCK=1`.

## Game (14, dikelompokkan per bidang)

| Bidang | Game | id |
|---|---|---|
| 📖 Membaca | Kenali Huruf · Suku Kata · Susun Huruf · Pasangkan Kata · Baca Kata · Baca Kalimat · Pecah Balon | `kenali-huruf` `suku-kata` `susun-huruf` `pasang-kata` `baca-kata` `baca-kalimat` `pecah-balon` |
| 🔢 Berhitung | Kenali Angka · Hitung Bersama · Lebih Banyak? · Bentuk & Pola | `kenali-angka` `hitung` `bandingkan` `bentuk-pola` |
| 🧠 Mengingat & Fokus | Tebak Kartu Ingatan | `tebak-kartu` |
| 🌏 Mengenal Dunia | Tebak Suara Hewan · Kenali Warna | `tebak-suara` `kenali-warna` |

Setiap game punya 4 tingkat. **Saat ini semua gratis** (`FREE_MODE`, lihat `src/engine/entitlement.ts`); set `NEXT_PUBLIC_FREE_MODE=0` untuk mengaktifkan kembali kunci Sulit & Ahli + paywall. Beranda juga memuat **Misi Hari Ini** (3 game seimbang antar bidang).
Lihat [`docs/KURIKULUM.md`](docs/KURIKULUM.md) untuk urutan belajar.

## Dokumen

- [`docs/KURIKULUM.md`](docs/KURIKULUM.md) — bidang belajar, urutan, misi harian
- [`docs/ARSITEKTUR.md`](docs/ARSITEKTUR.md) — struktur, prinsip, cara menambah game, tahapan
- [`docs/MONETISASI.md`](docs/MONETISASI.md) — model bisnis, aturan Play Store, alur pembayaran
- [`docs/PLAYSTORE.md`](docs/PLAYSTORE.md) — Capacitor, build AAB, daftar periksa rilis anak
- [`supabase/schema.sql`](supabase/schema.sql) — skema database + RLS

## Sebelum rilis publik (wajib)

- [ ] Isi semua `[PLACEHOLDER]` di `src/app/privasi/page.tsx` dan tinjau dengan konsultan hukum.
- [ ] Ganti ikon sementara (`public/icons`, `src/app/icon.png`, `apple-icon.png`) dengan logo final.
- [ ] Ganti nama sementara "Main Pintar" bila perlu (`layout.tsx`, `manifest.webmanifest`).
- [ ] Hubungkan pembayaran sungguhan (RevenueCat / Stripe / Xendit) dan webhook entitlement.
- [ ] Rekam suara asli (`public/audio/…`) agar tidak bergantung TTS perangkat.
- [ ] Uji di perangkat Android nyata (suara TTS Indonesia, musik, sentuhan, offline).
- [ ] Pastikan `NEXT_PUBLIC_DEV_UNLOCK` bukan `1` di produksi.
