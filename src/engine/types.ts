import type { ComponentType } from "react";

export interface Level {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  /** terkunci untuk pengguna gratis */
  premium?: boolean;
}

export interface CategoryOption {
  id: string;
  name: string;
  emoji: string;
}

export interface FinishResult {
  score: number;
  total: number;
}

/** Yang diterima setiap game dari GameRunner. */
export interface PlayProps {
  level: Level;
  /** id kategori / mode yang dipilih (mis. "hewan", "huruf") */
  category: string;
  /** panggil saat satu putaran selesai; runner mencatat skor & menampilkan hasil */
  onFinish(result: FinishResult): void;
}

/** Bidang belajar (kurikulum). Daftar lengkapnya ada di engine/areas.ts. */
export type AreaId = "membaca" | "berhitung" | "mengingat" | "dunia";

export interface GameDefinition {
  id: string;
  /** bidang belajar tempat game ini dikelompokkan */
  area: AreaId;
  /** kemampuan yang dilatih, satu kalimat pendek (tampil untuk orang tua) */
  skill: string;
  title: string;
  emoji: string;
  /** warna utama game (CSS color) dan versi lembutnya (latar kartu) */
  color: string;
  soft: string;
  blurb: string;
  /** tempo musik latar (ketukan per menit) */
  tempo: number;
  levels: Level[];
  /** pilihan tema/mode; kosongkan bila tidak ada */
  categories?: CategoryOption[];
  defaultCategory?: string;
  categoryTitle?: string;
  /** jumlah poin maksimum satu putaran (bisa tergantung tingkat) */
  total: number | ((level: Level) => number);
  /** apakah game memakai pengaturan "tampilkan tulisan" */
  usesText?: boolean;
  Play: ComponentType<PlayProps>;
}

export const totalFor = (g: GameDefinition, level: Level) =>
  typeof g.total === "function" ? g.total(level) : g.total;
