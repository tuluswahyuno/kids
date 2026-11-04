import type { GameDefinition } from "@/engine/types";
import { ROUNDS } from "./logic";
import { SusunHurufPlay } from "./SusunHurufPlay";

export const susunHuruf: GameDefinition = {
  id: "susun-huruf",
  area: "membaca",
  skill: "Mengeja kata dari huruf",
  title: "Susun Huruf",
  emoji: "🔤",
  color: "#4c6ef5",
  soft: "#eef1ff",
  blurb: "Lihat gambar, lalu susun hurufnya jadi kata!",
  tempo: 96,
  usesText: false,
  levels: [
    { id: "mudah", name: "Mudah", emoji: "🌱", desc: "3–5 huruf, ada petunjuk" },
    { id: "sedang", name: "Sedang", emoji: "🌼", desc: "5–6 huruf" },
    { id: "sulit", name: "Sulit", emoji: "🔥", desc: "6–9 huruf + huruf jebakan", premium: true },
  ],
  categoryTitle: "Pilih gambar:",
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
  Play: SusunHurufPlay,
};
