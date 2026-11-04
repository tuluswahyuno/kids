import type { GameDefinition } from "@/engine/types";
import { KenaliWarnaPlay } from "./KenaliWarnaPlay";
import { ROUNDS } from "./logic";

export const kenaliWarna: GameDefinition = {
  id: "kenali-warna",
  area: "dunia",
  skill: "Mengenal nama warna",
  title: "Kenali Warna",
  emoji: "🎨",
  color: "#0b7285",
  soft: "#e3fafc",
  blurb: "Kenali nama-nama warna, lalu belajar mencampurnya!",
  tempo: 104,
  usesText: true,
  levels: [
    { id: "mudah", name: "Dengar & Pilih", emoji: "👂", desc: "Dengar nama warna, pilih kotaknya" },
    { id: "sedang", name: "Baca Nama Warna", emoji: "👀", desc: "Lihat warna, pilih namanya" },
    { id: "sulit", name: "Benda Berwarna Apa?", emoji: "🍌", desc: "Warna benda sehari-hari", premium: true },
    { id: "ahli", name: "Campur Warna", emoji: "🧪", desc: "Merah + kuning jadi apa?", premium: true },
  ],
  total: ROUNDS,
  Play: KenaliWarnaPlay,
};
