import type { GameDefinition } from "@/engine/types";
import { ROUNDS } from "./logic";
import { BacaKalimatPlay } from "./BacaKalimatPlay";

export const bacaKalimat: GameDefinition = {
  id: "baca-kalimat",
  area: "membaca",
  skill: "Membaca kalimat sederhana",
  title: "Baca Kalimat",
  emoji: "📝",
  color: "#f08c00",
  soft: "#fff4e0",
  blurb: "Baca kalimat pendek, lalu cocokkan dengan gambarnya!",
  tempo: 104,
  usesText: true,
  levels: [
    { id: "mudah", name: "Baca & Pilih Gambar", emoji: "🌱", desc: "Kalimat 2–3 kata, pilih gambarnya" },
    { id: "sedang", name: "Lengkapi Kalimat", emoji: "🌼", desc: "Pilih kata yang hilang" },
    { id: "sulit", name: "Kalimat Panjang", emoji: "🔥", desc: "Kalimat 4–5 kata, 4 gambar", premium: true },
    { id: "ahli", name: "Susun Kalimat", emoji: "🧩", desc: "Susun kata menjadi kalimat", premium: true },
  ],
  total: ROUNDS,
  Play: BacaKalimatPlay,
};
