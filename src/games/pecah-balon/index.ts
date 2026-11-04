import type { GameDefinition } from "@/engine/types";
import { ROUNDS } from "./logic";
import { PecahBalonPlay } from "./PecahBalonPlay";

export const pecahBalon: GameDefinition = {
  id: "pecah-balon",
  area: "membaca",
  skill: "Mengenal huruf dan angka",
  title: "Pecah Balon",
  emoji: "🎈",
  color: "#e64980",
  soft: "#ffe8f1",
  blurb: "Dengarkan perintahnya, lalu pecahkan balon yang benar sebelum terbang pergi!",
  tempo: 132,
  usesText: false,
  levels: [
    { id: "mudah", name: "Mudah", emoji: "🌱", desc: "4 balon, cukup cepat" },
    { id: "sedang", name: "Sedang", emoji: "🌼", desc: "6 balon, cepat" },
    { id: "sulit", name: "Sulit", emoji: "🔥", desc: "8 balon, ngebut", premium: true },
    { id: "ahli", name: "Ahli", emoji: "🚀", desc: "9 balon, kilat!", premium: true },
  ],
  categoryTitle: "Pilih permainan:",
  categories: [
    { id: "huruf", name: "Huruf", emoji: "🔤" },
    { id: "angka", name: "Angka", emoji: "🔢" },
  ],
  defaultCategory: "huruf",
  total: ROUNDS,
  Play: PecahBalonPlay,
};
