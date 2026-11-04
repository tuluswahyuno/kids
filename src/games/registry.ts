import type { GameDefinition } from "@/engine/types";
import { bacaKalimat } from "./baca-kalimat";
import { bacaKata } from "./baca-kata";
import { bandingkan } from "./bandingkan";
import { bentukPola } from "./bentuk-pola";
import { hitung } from "./hitung";
import { kenaliAngka } from "./kenali-angka";
import { kenaliHuruf } from "./kenali-huruf";
import { kenaliWarna } from "./kenali-warna";
import { pasangKata } from "./pasang-kata";
import { pecahBalon } from "./pecah-balon";
import { sukuKata } from "./suku-kata";
import { susunHuruf } from "./susun-huruf";
import { tebakKartu } from "./tebak-kartu";
import { tebakSuara } from "./tebak-suara";

/**
 * Daftar semua game. Di beranda game dikelompokkan per `area`; urutan di dalam
 * satu bidang mengikuti urutan belajar (kenal -> mengeja -> membaca).
 * Menambah game baru = buat folder di src/games/<id>/ yang mengekspor GameDefinition,
 * lalu daftarkan di sini.
 */
export const GAMES: GameDefinition[] = [
  // Membaca: huruf -> suku kata -> kata -> kalimat
  kenaliHuruf,
  sukuKata,
  susunHuruf,
  pasangKata,
  bacaKata,
  bacaKalimat,
  pecahBalon,
  // Berhitung: angka -> menghitung -> membandingkan
  kenaliAngka,
  hitung,
  bandingkan,
  bentukPola,
  // Mengingat & fokus
  tebakKartu,
  // Mengenal dunia
  tebakSuara,
  kenaliWarna,
];

export const gameById = (id: string) => GAMES.find((g) => g.id === id);
