import type { GameDefinition } from "@/engine/types";
import { LEVEL_CONFIG, totalPairs } from "./logic";
import { PasangKataPlay } from "./PasangKataPlay";

export const pasangKata: GameDefinition = {
  id: "pasang-kata",
  area: "membaca",
  skill: "Mengenal tulisan kata",
  title: "Pasangkan Kata",
  emoji: "🧩",
  color: "#7048e8",
  soft: "#efeaff",
  blurb: "Sentuh gambar, lalu sentuh tulisan yang cocok!",
  tempo: 100,
  usesText: false,
  levels: [
    { id: "mudah", name: "Mudah", emoji: "🌱", desc: "3 pasang × 3 papan" },
    { id: "sedang", name: "Sedang", emoji: "🌼", desc: "4 pasang × 3 papan" },
    { id: "sulit", name: "Sulit", emoji: "🔥", desc: "5 pasang × 2 papan", premium: true },
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
  total: (level) => totalPairs(LEVEL_CONFIG[level.id] ?? LEVEL_CONFIG.mudah),
  Play: PasangKataPlay,
};
