import type { GameDefinition } from "@/engine/types";
import { KenaliHurufPlay } from "./KenaliHurufPlay";
import { ROUNDS } from "./logic";

export const kenaliHuruf: GameDefinition = {
  id: "kenali-huruf",
  area: "membaca",
  skill: "Mengenal huruf dan bunyinya",
  title: "Kenali Huruf",
  emoji: "🔠",
  color: "#3b5bdb",
  soft: "#edf2ff",
  blurb: "Dengar namanya, lalu temukan hurufnya!",
  tempo: 100,
  usesText: true,
  levels: [
    { id: "mudah", name: "Huruf Besar", emoji: "🅰️", desc: "Dengar nama huruf, pilih huruf besar" },
    { id: "sedang", name: "Besar & Kecil", emoji: "🔡", desc: "Cari pasangan huruf besar dan kecil" },
    { id: "sulit", name: "Huruf Awal", emoji: "🖼️", desc: "Huruf apa di depan nama gambar?", premium: true },
    { id: "ahli", name: "Huruf Mirip", emoji: "🔍", desc: "b, d, p, q? Teliti membedakan huruf mirip", premium: true },
  ],
  total: ROUNDS,
  Play: KenaliHurufPlay,
};
