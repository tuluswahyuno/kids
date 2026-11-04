import type { GameDefinition } from "@/engine/types";
import { ROUNDS } from "./logic";
import { BacaKataPlay } from "./BacaKataPlay";

export const bacaKata: GameDefinition = {
  id: "baca-kata",
  area: "membaca",
  skill: "Membaca kata dan memahami artinya",
  title: "Baca Kata",
  emoji: "📖",
  color: "#d6336c",
  soft: "#fff0f6",
  blurb: "Baca kata ini, lalu pilih gambar yang cocok!",
  tempo: 100,
  usesText: true,
  levels: [
    { id: "mudah", name: "Kata Pendek", emoji: "🌱", desc: "Kata pendek, ada garis suku kata" },
    { id: "sedang", name: "Kata Biasa", emoji: "🌼", desc: "Kata sampai 7 huruf" },
    { id: "sulit", name: "Kata Panjang", emoji: "🔥", desc: "Semua kata, 6 pilihan gambar", premium: true },
    { id: "ahli", name: "Cepat Baca", emoji: "⚡", desc: "6 gambar, 10 detik tiap soal", premium: true },
  ],
  categoryTitle: "Pilih tema:",
  categories: [
    { id: "hewan", name: "Hewan", emoji: "🐘" },
    { id: "lokal", name: "Hewan Lokal", emoji: "🐅" },
    { id: "buah", name: "Buah", emoji: "🍎" },
    { id: "kendaraan", name: "Kendaraan", emoji: "🚗" },
    { id: "benda", name: "Benda", emoji: "🏠" },
    { id: "semua", name: "Campur", emoji: "🎲" },
  ],
  defaultCategory: "hewan",
  total: ROUNDS,
  Play: BacaKataPlay,
};
