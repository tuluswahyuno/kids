import type { GameDefinition } from "@/engine/types";
import { BentukPolaPlay } from "./BentukPolaPlay";
import { ROUNDS } from "./logic";

export const bentukPola: GameDefinition = {
  id: "bentuk-pola",
  area: "berhitung",
  skill: "Mengenal bentuk dan melanjutkan pola",
  title: "Bentuk & Pola",
  emoji: "🔷",
  color: "#9c36b5",
  soft: "#f8f0fc",
  blurb: "Kenali bentuk di sekitar kita, lalu lanjutkan pola yang seru!",
  tempo: 96,
  usesText: false,
  levels: [
    { id: "mudah", name: "Kenali Bentuk", emoji: "🔵", desc: "Pilih nama bentuknya" },
    { id: "sedang", name: "Bentuk Sekitar Kita", emoji: "🍪", desc: "Benda berbentuk apa? Mana yang sama?" },
    { id: "sulit", name: "Lanjutkan Pola", emoji: "🔁", desc: "Pola AB, AAB, ABB", premium: true },
    { id: "ahli", name: "Pola Rumit", emoji: "🧩", desc: "Cari gambar yang hilang di tengah", premium: true },
  ],
  total: ROUNDS,
  Play: BentukPolaPlay,
};
