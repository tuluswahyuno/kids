# Arsitektur Main Pintar

## Gambaran

```
                       ┌─────────────────────────────────────────┐
  Anak (HP/tablet/PC)  │  Next.js (static export) + TypeScript   │
  ───────────────────► │                                         │
   web  /  PWA  /      │  src/engine   mesin bersama             │
   APK (Capacitor)     │  src/games    1 folder = 1 game         │
                       │  src/content  konten sebagai DATA       │
                       └───────────────┬─────────────────────────┘
                                       │ (tahap 3)
                       ┌───────────────▼─────────────────────────┐
                       │ Supabase: Auth · Postgres (RLS) · Storage│
                       │ + webhook RevenueCat → tabel entitlements│
                       └─────────────────────────────────────────┘
```

Satu build statis (`next build` → folder `out/`) dipakai untuk **tiga** target:
web (Vercel/Cloudflare Pages), PWA terpasang, dan aplikasi Android (dibungkus Capacitor).

## Folder

| Folder | Isi |
|---|---|
| `src/content/items.ts` | Semua hewan/buah/kendaraan/benda sebagai data. Tambah konten = tambah baris. |
| `src/engine/` | `GameRunner` (menu→main→hasil), audio (suara/efek/musik), profil anak, progres, entitlement, pelindung orang tua, paywall, hook timer. |
| `src/games/<id>/` | `logic.ts` (fungsi murni, dites), `<Nama>Play.tsx`, `*.module.css`, `index.ts` (GameDefinition). |
| `src/games/registry.ts` | Daftar game. Satu-satunya tempat mendaftarkan game baru. |
| `src/app/` | Rute: `/` beranda, `/game/[id]`, `/orang-tua`, `/orang-tua/premium`, `/privasi`. |
| `src/lib/` | `store` (localStorage reaktif), `random` (RNG bisa disuntik), `billing` (lapisan pembayaran). |
| `supabase/schema.sql` | Skema database + RLS. |
| `public/` | PWA: `manifest.webmanifest`, `sw.js`, ikon. |

## Prinsip desain

1. **Game = soal saja.** Skor, bintang, rekor, kunci premium, musik, dan tombol keluar diurus `GameRunner`.
2. **Konten = data**, bukan kode. Nanti dipindah ke tabel/CMS tanpa mengubah game.
3. **Logika murni dipisah dari tampilan** (`logic.ts`) dengan RNG yang disuntik → mudah dites dengan seed.
4. **Satu sumber data pemain**: `Session {profile, game, level, category, score, total, at}`. Dari sini muncul rekor, bintang, streak, dan dasbor orang tua.
5. **Privasi anak by default**: profil hanya nama panggilan + avatar. Tanpa iklan, tanpa pelacak pihak ketiga.
6. **Offline-first**: service worker meng-cache aset; progres di localStorage, disinkronkan belakangan.

## Menambah game baru

1. Buat `src/games/<id>/` dengan `logic.ts`, `<Nama>Play.tsx`, `index.ts` (ekspor `GameDefinition`).
2. Daftarkan di `src/games/registry.ts`.
3. Tulis `logic.test.ts`. Selesai — kartu di beranda dan rute `/game/<id>/` otomatis muncul.

## Rencana tahap

| Tahap | Isi | Status |
|---|---|---|
| 1 | Next.js + TS, konten data, mesin game, profil, progres, PWA, gerbang orang tua | ✅ |
| 1b | 14 game dalam 4 bidang belajar, Misi Hari Ini, laporan per bidang | ✅ |
| 2 | Rekaman suara asli (`/public/audio`), ilustrasi menggantikan emoji, ikon final, uji perangkat nyata | ⏳ |
| 3 | Supabase: login orang tua (kode email), sinkronisasi sesi, entitlement dari server, hapus akun | 🟡 kode siap, **belum diuji ke Supabase sungguhan** (lihat bawah) |
| 4 | Capacitor Android + RevenueCat + rilis Play Store (lihat `PLAYSTORE.md`, `MONETISASI.md`) | ⏳ |
| 5 | CMS konten, game baru berkala, laporan mingguan ke email orang tua | ⏳ |

## Perintah

```bash
npm run dev         # pengembangan
npm test            # tes logika game
npm run typecheck   # TypeScript
npm run lint
npm run build       # menghasilkan folder out/ (static export)
```

## Catatan build

- **404 *prefetch* di konsol (belum terselesaikan).** Pada build Windows (Next 16.4, static export), berkas
  *segment prefetch* ditaruh sebagai folder bersarang (`__next.game/$d$id/__PAGE__.txt`), sedangkan browser memintanya
  dengan nama bertitik (`__next.game.$d$id.__PAGE__.txt`). Hasilnya 404 di konsol; tidak fatal karena Next jatuh ke
  navigasi biasa. **Dugaan** (belum diverifikasi): ini khusus Windows. Cek dengan build dari CI Linux
  (`.github/workflows/ci.yml`, artefak `web-out`) sebelum rilis; bila masih ada, laporkan ke Next.js atau ubah rute.
- `ParentGate` dan hal apa pun yang memakai angka acak harus dirender hanya di klien (lihat komentar di
  `src/engine/ParentGate.tsx`), kalau tidak hidrasi gagal (React error #418).
- Jangan aktifkan `cacheComponents` bersama `output: "export"`.

## Masalah yang diketahui

- Pecah Balon tingkat Ahli (9 balon) pada layar 360px: tumpang tindih sudah dikurangi (lebar balon menyesuaikan jumlah, balon ganjil diluncurkan lebih lambat), tetapi dua balon masih bisa bersentuhan sesaat. Belum diuji di perangkat nyata.
- Semua gambar masih emoji (tampilan bergantung OS). Ganti dengan ilustrasi di tahap 2.
- Suara hewan dibuat TTS; rekaman asli dipasang lewat `ContentItem.audio` (sudah didukung `speak({clip})`).

## Tahap 3: akun & sinkronisasi (kode ada, belum diuji end-to-end)

- `src/lib/supabase.ts` (klien opsional; tanpa env fitur akun tersembunyi), `src/lib/sync.ts` (pemetaan murni, dites),
  `src/engine/account.ts` (login kode email, `syncNow`, `deleteAccount`), `src/components/AccountPanel.tsx` (di area orang tua).
- Sinkron: anak → sesi (idempoten by id) → tarik server → baca `entitlements`. Premium dari server menimpa cache lokal.
- Untuk mengaktifkan: buat proyek Supabase, jalankan `supabase/schema.sql`, isi `.env.local`
  (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`), aktifkan Email OTP (templat email harus memuat `{{ .Token }}`).
- Belum ada: webhook pembayaran yang mengisi `entitlements`, pengelolaan konflik edit profil antar perangkat (saat ini: profil dari server hanya ditambahkan, tidak menimpa).
