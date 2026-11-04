import type { GameDefinition } from "@/engine/types";
import { ROUNDS } from "./logic";
import { SukuKataPlay } from "./SukuKataPlay";

export const sukuKata: GameDefinition = {
  id: "suku-kata",
  area: "membaca",
  skill: "Membaca suku kata dan kata",
  title: "Suku Kata",
  emoji: "🧱",
  color: "#1971c2",
  soft: "#e7f5ff",
  blurb: "Kenali suku kata, lalu susun jadi kata!",
  tempo: 108,
  usesText: false,
  levels: [
    { id: "mudah", name: "Kenali Suku Kata", emoji: "👂", desc: "Dengar ba, bi, bu... lalu pilih tulisannya" },
    { id: "sedang", name: "Susun Kata", emoji: "🧩", desc: "Susun 2 suku kata jadi kata" },
    { id: "sulit", name: "Kata 3 Suku", emoji: "🔥", desc: "Susun kata dari 3 suku kata", premium: true },
    { id: "ahli", name: "Suku Kata Tertutup", emoji: "🏆", desc: "Kata seperti bu-lan dan ma-kan", premium: true },
  ],
  total: ROUNDS,
  Play: SukuKataPlay,
};
