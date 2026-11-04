/** Data khusus game Kenali Warna. */

export type ColorId =
  | "merah"
  | "kuning"
  | "biru"
  | "hijau"
  | "oranye"
  | "ungu"
  | "merah-muda"
  | "cokelat"
  | "hitam"
  | "putih"
  | "abu-abu";

export interface ColorDef {
  id: ColorId;
  name: string;
  hex: string;
  /** contoh benda yang JUJUR berwarna ini */
  emoji: string;
}

export const COLORS: readonly ColorDef[] = [
  { id: "merah", name: "merah", hex: "#e03131", emoji: "🍅" },
  { id: "kuning", name: "kuning", hex: "#fcc419", emoji: "🍌" },
  { id: "biru", name: "biru", hex: "#1971c2", emoji: "🫐" },
  { id: "hijau", name: "hijau", hex: "#2f9e44", emoji: "🥦" },
  { id: "oranye", name: "oranye", hex: "#f76707", emoji: "🍊" },
  { id: "ungu", name: "ungu", hex: "#862e9c", emoji: "🍇" },
  { id: "merah-muda", name: "merah muda", hex: "#f783ac", emoji: "🐷" },
  { id: "cokelat", name: "cokelat", hex: "#7f4f24", emoji: "🍫" },
  { id: "hitam", name: "hitam", hex: "#212529", emoji: "🎩" },
  { id: "putih", name: "putih", hex: "#ffffff", emoji: "🥚" },
  { id: "abu-abu", name: "abu-abu", hex: "#868e96", emoji: "🐘" },
];

export const COLOR_BY_ID = Object.fromEntries(COLORS.map((c) => [c.id, c])) as Record<ColorId, ColorDef>;

/** Warna dasar untuk tingkat pertama (kenal dulu, baru campur). */
export const BASIC: readonly ColorId[] = ["merah", "kuning", "biru", "hijau", "oranye", "ungu"];

/** Warna yang tampak mirip: tidak boleh jadi pengecoh satu sama lain. */
const SIMILAR_PAIRS: ReadonlyArray<readonly [ColorId, ColorId]> = [
  ["merah", "oranye"],
  ["merah", "merah-muda"],
  ["merah", "cokelat"],
  ["oranye", "kuning"],
  ["oranye", "cokelat"],
  ["biru", "ungu"],
  ["ungu", "merah-muda"],
  ["hitam", "abu-abu"],
  ["hitam", "cokelat"],
  ["putih", "abu-abu"],
];

export const isSimilar = (a: ColorId, b: ColorId) =>
  SIMILAR_PAIRS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

export interface ColorObject {
  emoji: string;
  name: string;
  color: ColorId;
}

/** Hanya benda yang warnanya tidak ambigu. */
export const OBJECTS: readonly ColorObject[] = [
  { emoji: "🍅", name: "Tomat", color: "merah" },
  { emoji: "🍎", name: "Apel merah", color: "merah" },
  { emoji: "🍓", name: "Stroberi", color: "merah" },
  { emoji: "🍌", name: "Pisang", color: "kuning" },
  { emoji: "🍋", name: "Lemon", color: "kuning" },
  { emoji: "🐥", name: "Anak ayam", color: "kuning" },
  { emoji: "🫐", name: "Blueberry", color: "biru" },
  { emoji: "💙", name: "Hati biru", color: "biru" },
  { emoji: "🥦", name: "Brokoli", color: "hijau" },
  { emoji: "🐸", name: "Katak", color: "hijau" },
  { emoji: "🥒", name: "Timun", color: "hijau" },
  { emoji: "🍊", name: "Jeruk", color: "oranye" },
  { emoji: "🥕", name: "Wortel", color: "oranye" },
  { emoji: "🎃", name: "Labu", color: "oranye" },
  { emoji: "🍇", name: "Anggur", color: "ungu" },
  { emoji: "🍆", name: "Terong", color: "ungu" },
  { emoji: "🐷", name: "Babi", color: "merah-muda" },
  { emoji: "🌸", name: "Bunga sakura", color: "merah-muda" },
  { emoji: "🍫", name: "Cokelat", color: "cokelat" },
  { emoji: "🐻", name: "Beruang", color: "cokelat" },
  { emoji: "🎩", name: "Topi hitam", color: "hitam" },
  { emoji: "🕶️", name: "Kacamata hitam", color: "hitam" },
  { emoji: "⛄", name: "Manusia salju", color: "putih" },
  { emoji: "🥚", name: "Telur", color: "putih" },
  { emoji: "🥛", name: "Susu", color: "putih" },
  { emoji: "🐘", name: "Gajah", color: "abu-abu" },
  { emoji: "🐭", name: "Tikus", color: "abu-abu" },
  { emoji: "🪨", name: "Batu", color: "abu-abu" },
];

export interface Recipe {
  a: ColorId;
  b: ColorId;
  result: ColorId;
}

export const RECIPES: readonly Recipe[] = [
  { a: "merah", b: "kuning", result: "oranye" },
  { a: "biru", b: "kuning", result: "hijau" },
  { a: "merah", b: "biru", result: "ungu" },
  { a: "merah", b: "putih", result: "merah-muda" },
  { a: "hitam", b: "putih", result: "abu-abu" },
];
