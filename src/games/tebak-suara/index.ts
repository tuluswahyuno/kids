import type { GameDefinition } from "@/engine/types";
import { ROUNDS } from "./logic";
import { TebakSuaraPlay } from "./TebakSuaraPlay";

export const tebakSuara: GameDefinition = {
  id: "tebak-suara",
  area: "dunia",
  skill: "Mengenal hewan dan suaranya",
  title: "Tebak Suara Hewan",
  emoji: "🔊",
  color: "#e8590c",
  soft: "#fff0e0",
  blurb: "Dengarkan suaranya, lalu tebak hewan apa itu!",
  tempo: 100,
  usesText: false,
  levels: [
    { id: "mudah", name: "Mudah", emoji: "🌱", desc: "3 pilihan, ada tulisan suara" },
    { id: "sedang", name: "Sedang", emoji: "🌼", desc: "4 pilihan, dengarkan saja" },
    { id: "sulit", name: "Sulit", emoji: "🔥", desc: "Teka-teki ciri hewan", premium: true },
    { id: "ahli", name: "Ahli", emoji: "🏆", desc: "6 pilihan, tanpa nama", premium: true },
  ],
  total: ROUNDS,
  Play: TebakSuaraPlay,
};
