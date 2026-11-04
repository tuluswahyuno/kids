import type { GameDefinition } from "@/engine/types";
import { KenaliAngkaPlay } from "./KenaliAngkaPlay";
import { ROUNDS } from "./logic";

export const kenaliAngka: GameDefinition = {
  id: "kenali-angka",
  area: "berhitung",
  skill: "Mengenal lambang bilangan dan urutannya",
  title: "Kenali Angka",
  emoji: "🔟",
  color: "#0c8599",
  soft: "#e3fafc",
  blurb: "Kenali angka, cari yang hilang, dan urutkan!",
  tempo: 96,
  usesText: false,
  levels: [
    { id: "mudah", name: "Angka 1–5", emoji: "🌱", desc: "Kenali angka 1 sampai 5" },
    { id: "sedang", name: "Angka 1–10", emoji: "🌼", desc: "Sebelum, sesudah, yang hilang" },
    { id: "sulit", name: "Angka 1–20", emoji: "🔥", desc: "Belasan: sebelas sampai dua puluh", premium: true },
    { id: "ahli", name: "Urutkan Angka", emoji: "🏆", desc: "Urutkan dari kecil ke besar", premium: true },
  ],
  total: ROUNDS,
  Play: KenaliAngkaPlay,
};
