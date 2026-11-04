import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Kebijakan Privasi" };

/**
 * DRAFT kebijakan privasi. Wajib ditinjau konsultan hukum sebelum rilis, dan
 * disesuaikan dengan fitur yang benar-benar aktif (akun, sinkronisasi, analitik).
 * Ganti semua [PLACEHOLDER].
 */
export default function PrivacyPage() {
  return (
    <main className="page">
      <Link className="backlink" href="/">
        ← Kembali
      </Link>
      <h1 className="gametitle">🔐 Kebijakan Privasi</h1>
      <article className="panel prose">
        <p>
          <small>Terakhir diperbarui: [TANGGAL]. Berlaku untuk aplikasi dan situs Main Pintar yang dikelola [NAMA PERUSAHAAN / PEMILIK].</small>
        </p>

        <h2>Ringkasnya</h2>
        <ul>
          <li>Main Pintar dibuat untuk anak usia 4–7 tahun dan dipakai bersama orang tua.</li>
          <li>Kami <b>tidak menampilkan iklan</b> dan <b>tidak menjual data</b>.</li>
          <li>Kami tidak meminta email, foto, tanggal lahir, atau lokasi anak. Profil anak hanya berisi nama panggilan dan gambar avatar.</li>
        </ul>

        <h2>Data yang disimpan</h2>
        <ul>
          <li>
            <b>Di perangkat Anda:</b> nama panggilan anak, avatar, skor, dan pengaturan (suara, musik). Data ini tersimpan di penyimpanan
            browser/aplikasi dan bisa dihapus kapan saja dari menu <i>Untuk Orang Tua → Hapus semua data</i>.
          </li>
          <li>
            <b>Akun orang tua (jika Anda membuatnya):</b> alamat email orang tua dan status langganan, agar progres bisa disinkronkan
            antar perangkat. Data anak yang disinkronkan hanya nama panggilan, avatar, dan skor.
          </li>
          <li>
            <b>Pembayaran:</b> diproses oleh Google Play atau penyedia pembayaran kami. Kami tidak menyimpan nomor kartu.
          </li>
        </ul>

        <h2>Persetujuan orang tua</h2>
        <p>
          Sesuai Undang-Undang Pelindungan Data Pribadi (UU No. 27 Tahun 2022), pemrosesan data anak memerlukan persetujuan orang tua
          atau wali. Fitur akun, pembelian, dan pengaturan dilindungi gerbang orang tua.
        </p>

        <h2>Analitik</h2>
        <p>
          [Pilih salah satu: Kami tidak memakai analitik pihak ketiga. / Kami memakai analitik tanpa identitas untuk memperbaiki
          game, tanpa pelacakan lintas aplikasi dan tanpa ID iklan.]
        </p>

        <h2>Hak Anda</h2>
        <p>
          Orang tua dapat meminta akses, perbaikan, atau penghapusan data anak kapan saja dengan menghubungi kami di [EMAIL KONTAK].
          Kami akan menanggapi dalam [30] hari.
        </p>

        <h2>Keamanan</h2>
        <p>Data yang dikirim ke server dienkripsi saat transit (HTTPS) dan disimpan pada layanan dengan kontrol akses ketat.</p>

        <h2>Perubahan</h2>
        <p>Jika kebijakan ini berubah secara berarti, kami akan memberi tahu orang tua di dalam aplikasi.</p>

        <h2>Kontak</h2>
        <p>[NAMA], [ALAMAT], [EMAIL KONTAK]</p>
      </article>
    </main>
  );
}
