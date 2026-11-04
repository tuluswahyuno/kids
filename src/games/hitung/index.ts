import type { GameDefinition } from "@/engine/types";
import { HitungPlay } from "./HitungPlay";
import { ROUNDS } from "./logic";

export const hitung: GameDefinition = {
  id: "hitung",
  area: "berhitung",
  skill: "Menghitung, menambah, mengurang",
  title: "Hitung Bersama",
  emoji: "🔢",
  color: "#5c940d",
  soft: "#ebfbee",
  blurb: "Hitung gambarnya, lalu pilih angka yang benar!",
  tempo: 104,
  usesText: false,
  levels: [
    { id: "mudah", name: "Mudah", emoji: "🌱", desc: "Hitung gambar 1–5" },
    { id: "sedang", name: "Sedang", emoji: "🌼", desc: "Hitung gambar 1–10" },
    { id: "sulit", name: "Sulit", emoji: "🔥", desc: "Tambah sampai 10", premium: true },
    { id: "ahli", name: "Ahli", emoji: "🏆", desc: "Tambah & kurang sampai 20", premium: true },
  ],
  total: ROUNDS,
  Play: HitungPlay,
};
