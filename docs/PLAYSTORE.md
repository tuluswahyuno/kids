# Menerbitkan ke Play Store (Capacitor)

Build statis Next.js (`out/`) dibungkus Capacitor menjadi aplikasi Android. Tidak perlu menulis ulang.

## 1. Pasang Capacitor

```bash
npm i @capacitor/core @capacitor/android
npm i -D @capacitor/cli
npx cap init "Main Pintar" id.contoh.mainpintar --web-dir=out   # ganti appId milik Anda
npm run build
npx cap add android
npx cap sync
npx cap open android      # membuka Android Studio
```

`capacitor.config.ts` minimal:

```ts
import type { CapacitorConfig } from "@capacitor/cli";
const config: CapacitorConfig = {
  appId: "id.contoh.mainpintar",
  appName: "Main Pintar",
  webDir: "out",
  android: { allowMixedContent: false },
  server: { androidScheme: "https" },
};
export default config;
```

Setiap kali kode berubah: `npm run build && npx cap sync`.

## 2. Tambahan native yang disarankan

- `@revenuecat/purchases-capacitor` — Play Billing (lihat `MONETISASI.md`).
- `@capacitor/status-bar`, `@capacitor/splash-screen` — tampilan penuh layar.
- `@capacitor/app` — tombol kembali Android.
- Kunci orientasi? Game ini nyaman portrait & landscape; biarkan bebas.
- Ikon adaptif: gunakan `public/icons/maskable-512.png` (ganti dengan logo final).

## 3. Persiapan rilis

1. Buat keystore penandatanganan, simpan aman (**kehilangan = tidak bisa update**). Aktifkan *Play App Signing*.
2. Build **AAB** (`Build → Generate Signed Bundle`), bukan APK.
3. Uji di perangkat nyata: suara TTS Indonesia, musik, sentuhan, mode landscape, offline.
4. Pengujian tertutup: akun baru wajib **12 penguji selama 14 hari** sebelum bisa rilis produksi.

## 4. Daftar periksa Play Console (aplikasi anak)

- [ ] Target audiens: **usia 5 tahun ke bawah / 6–8** → masuk *Designed for Families*.
- [ ] Kebijakan privasi di URL publik (`/privasi/`, setelah placeholder diisi & ditinjau hukum).
- [ ] Formulir **Data Safety** jujur (data yang dikumpulkan, dibagikan, enkripsi, hapus data).
- [ ] Rating konten (IARC).
- [ ] Tanpa ID iklan, tanpa SDK iklan/pelacak yang tidak disertifikasi keluarga.
- [ ] Gerbang orang tua pada pembelian & tautan keluar (sudah ada).
- [ ] Deskripsi, tangkapan layar (HP + tablet 7"/10"), grafik fitur 1024×500, ikon 512×512.
- [ ] Tidak ada klaim medis/edukasi berlebihan tanpa bukti.

## 5. Alternatif: TWA / PWA

Jika ingin cepat: PWA ini bisa dibungkus **Trusted Web Activity** (Bubblewrap). Lebih ringan, tetapi
Play Billing lewat TWA lebih rumit — Capacitor lebih mudah untuk aplikasi berbayar.
