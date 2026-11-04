import type { GameDefinition } from "@/engine/types";
import { BandingkanPlay } from "./BandingkanPlay";
import { ROUNDS } from "./logic";

export const bandingkan: GameDefinition = {
  id: "bandingkan",
  area: "berhitung",
  skill: "Membandingkan banyak dan besar bilangan",
  title: "Lebih Banyak?",
  emoji: "⚖️",
  color: "#d9480f",
  soft: "#fff4e6",
  blurb: "Mana yang lebih banyak? Bandingkan dan pilih!",
  tempo: 108,
  usesText: false,
  levels: [
    { id: "mudah", name: "Lebih Banyak", emoji: "🌱", desc: "Pilih kelompok yang lebih banyak" },
    { id: "sedang", name: "Banyak & Sedikit", emoji: "🌼", desc: "Lebih banyak, lebih sedikit, atau sama", },
    { id: "sulit", name: "Bandingkan Angka", emoji: "🔥", desc: "Bandingkan dua angka sampai 20", premium: true },
    { id: "ahli", name: "Hitung dulu", emoji: "🏆", desc: "Hitung dulu, lalu bandingkan hasilnya", premium: true },
  ],
  total: ROUNDS,
  Play: BandingkanPlay,
};
