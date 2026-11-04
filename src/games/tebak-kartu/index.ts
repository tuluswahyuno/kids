import type { GameDefinition } from "@/engine/types";
import { ROUNDS } from "./logic";
import { TebakKartuPlay } from "./TebakKartuPlay";

export const tebakKartu: GameDefinition = {
  id: "tebak-kartu",
  area: "mengingat",
  skill: "Daya ingat visual",
  title: "Tebak Kartu Ingatan",
  emoji: "🧠",
  color: "#ff8a5c",
  soft: "#fff0e6",
  blurb: "Lihat 10 kartu, ingat baik-baik, lalu tebak!",
  tempo: 100,
  usesText: true,
  levels: [
    { id: "mudah", name: "Mudah", emoji: "🌱", desc: "60 detik, 4 pilihan" },
    { id: "sedang", name: "Sedang", emoji: "🌼", desc: "45 detik, 6 pilihan" },
    { id: "sulit", name: "Sulit", emoji: "🔥", desc: "30 detik, 8 pilihan, 12 detik/tebakan", premium: true },
    { id: "ahli", name: "Ahli", emoji: "🏆", desc: "20 detik, urutan acak, 8 detik/tebakan", premium: true },
  ],
  categoryTitle: "Pilih kartu:",
  categories: [
    { id: "buah", name: "Buah", emoji: "🍎" },
    { id: "hewan", name: "Hewan", emoji: "🐶" },
    { id: "lokal", name: "Hewan Lokal", emoji: "🐅" },
    { id: "kendaraan", name: "Kendaraan", emoji: "🚗" },
    { id: "semua", name: "Campur", emoji: "🎲" },
  ],
  defaultCategory: "buah",
  total: ROUNDS,
  Play: TebakKartuPlay,
};
