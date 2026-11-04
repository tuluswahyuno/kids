# Kurikulum & Jalur Belajar

Sasaran: anak usia **5–7 tahun** (TK B – awal SD kelas 1). Pendekatan: **bermain**, sesi pendek (± 3–5 menit per game),
didampingi orang tua. Game ini bukan pengganti sekolah dan tidak mengklaim hasil medis/akademik tertentu.

> Catatan kebijakan: di PAUD, calistung (baca-tulis-hitung) tidak diajarkan sebagai tuntutan formal; yang
> dikembangkan adalah **pengenalan** (literasi & numerasi awal) lewat kegiatan menyenangkan. Konten di sini
> mengikuti semangat itu: tanpa hukuman, tanpa peringkat antar-anak, tanpa batas waktu yang menekan di tingkat awal.

## Peta bidang

| Bidang | Tujuan | Game |
|---|---|---|
| 📖 **Membaca** | huruf → suku kata → kata → kalimat | Kenali Huruf · Suku Kata · Susun Huruf · Pasangkan Kata · Baca Kata · Baca Kalimat · Pecah Balon (huruf) |
| 🔢 **Berhitung** | angka → menghitung → membandingkan → tambah/kurang → bentuk & pola | Kenali Angka · Hitung Bersama · Lebih Banyak? · Bentuk & Pola · Pecah Balon (angka) |
| 🧠 **Mengingat & Fokus** | memori kerja, perhatian, reaksi | Tebak Kartu Ingatan |
| 🌏 **Mengenal Dunia** | hewan, suara, warna, benda sekitar | Tebak Suara Hewan · Kenali Warna |

## Urutan belajar yang disarankan

**Membaca**
1. **Kenali Huruf** — nama huruf, besar/kecil, bunyi awal.
2. **Suku Kata** — ba-bi-bu-be-bo, lalu menyusun kata (ba-ju).
3. **Susun Huruf** — mengeja kata dari huruf.
4. **Pasangkan Kata** / **Baca Kata** — kata ↔ gambar.
5. **Baca Kalimat** — kalimat pendek, melengkapi, menyusun.

**Berhitung**
1. **Kenali Angka** — lambang 1–10, lalu 11–20, urutan.
2. **Hitung Bersama** — menghitung benda, tambah, kurang.
3. **Lebih Banyak?** — membandingkan banyak dan besar bilangan.
4. **Bentuk & Pola** — bentuk dasar dan pola berulang.

## Tingkat kesulitan (semua game)

| Tingkat | Akses | Prinsip |
|---|---|---|
| 🌱 Mudah | Gratis | Dukungan penuh: petunjuk, pilihan sedikit, tanpa waktu |
| 🌼 Sedang | Gratis | Petunjuk berkurang, pilihan lebih banyak |
| 🔥 Sulit | Premium | Pengecoh mirip, materi lebih panjang |
| 🏆 Ahli | Premium | Tanpa petunjuk, kadang berbatas waktu |

## Misi Hari Ini

3 game pendek per hari, satu dari tiap kelompok (Membaca, Berhitung, Mengingat/Dunia), dipilih dari game yang
**paling jarang dimainkan minggu ini** (deterministik per hari). Tujuannya keseimbangan, bukan memaksa.
Kode: `src/engine/mission.ts` (dites).

## Laporan orang tua

`/orang-tua/` menampilkan per anak: bintang, hari beruntun, 7 hari terakhir, **akurasi per bidang** dan per game
beserta kemampuan yang dilatih (`GameDefinition.skill`). Bidang yang belum dilatih ditandai.

## Menambah materi

- Konten bersama (hewan, buah, …) → `src/content/items.ts`.
- Konten khusus game (huruf, suku kata, kalimat) → `src/content/<nama>.ts`, selalu disertai tes integritas
  (id unik, ejaan, emoji tidak ambigu).
- Game baru → folder `src/games/<id>/`, isi `area` dan `skill`, daftarkan di `registry.ts`.
  `registry.test.ts` memeriksa kelengkapan metadata otomatis.

## Yang masih perlu validasi manusia

- Ejaan & pemenggalan suku kata (PUEBI) dan kosakata kalimat → **tinjau oleh guru TK/PAUD atau ahli bahasa Indonesia**.
- Urutan dan batas usia → uji dengan beberapa anak, amati di mana mereka macet.
- TTS bahasa Indonesia bervariasi antar perangkat; untuk huruf/suku kata sebaiknya ganti dengan **rekaman** (fonik).
