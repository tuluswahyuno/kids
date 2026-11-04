/** Data khusus game Bentuk & Pola: bentuk, warna, dan benda sehari-hari. */

export type ShapeId =
  | "lingkaran"
  | "persegi"
  | "segitiga"
  | "persegi-panjang"
  | "bintang"
  | "hati"
  | "belah-ketupat";

export const SHAPE_IDS: readonly ShapeId[] = [
  "lingkaran",
  "persegi",
  "segitiga",
  "persegi-panjang",
  "bintang",
  "hati",
  "belah-ketupat",
];

export const SHAPE_NAME: Record<ShapeId, string> = {
  lingkaran: "Lingkaran",
  persegi: "Persegi",
  segitiga: "Segitiga",
  "persegi-panjang": "Persegi panjang",
  bintang: "Bintang",
  hati: "Hati",
  "belah-ketupat": "Belah ketupat",
};

/** Pasangan yang mudah tertukar bagi anak kecil: jangan disajikan berdampingan sebagai pilihan. */
export const CONFUSABLE: ReadonlyArray<readonly [ShapeId, ShapeId]> = [["persegi", "persegi-panjang"]];

export const confusable = (a: ShapeId, b: ShapeId) =>
  CONFUSABLE.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

export type ColorId = "merah" | "biru" | "kuning" | "hijau" | "oranye" | "ungu" | "merah-muda";

export const COLOR: Record<ColorId, { name: string; hex: string }> = {
  merah: { name: "merah", hex: "#e03131" },
  biru: { name: "biru", hex: "#1c7ed6" },
  kuning: { name: "kuning", hex: "#fcc419" },
  hijau: { name: "hijau", hex: "#2f9e44" },
  oranye: { name: "oranye", hex: "#f76707" },
  ungu: { name: "ungu", hex: "#9c36b5" },
  "merah-muda": { name: "merah muda", hex: "#f783ac" },
};

export const COLOR_IDS = Object.keys(COLOR) as ColorId[];

/** Warna bawaan tiap bentuk (dipakai pada soal pola berbasis bentuk). */
export const DEFAULT_COLOR: Record<ShapeId, ColorId> = {
  lingkaran: "merah",
  persegi: "biru",
  segitiga: "kuning",
  "persegi-panjang": "hijau",
  bintang: "oranye",
  hati: "merah-muda",
  "belah-ketupat": "ungu",
};

export type Fill = "solid" | "stripe" | "dots" | "grid";

export const FILL_NAME: Record<Fill, string> = {
  solid: "",
  stripe: "bergaris",
  dots: "berbintik",
  grid: "berpetak",
};

/** Pola isi tetap untuk tiap warna pada soal pola berbasis warna (pembeda selain warna). */
export const FILL_COLORS: readonly ColorId[] = ["merah", "biru", "kuning", "hijau"];
export const FILL_OF: Partial<Record<ColorId, Fill>> = {
  merah: "solid",
  biru: "stripe",
  kuning: "dots",
  hijau: "grid",
};

export interface ShapeObject {
  emoji: string;
  name: string;
}

/** Benda yang bentuknya JELAS menyerupai bentuk tertentu. */
export const OBJECTS: Record<ShapeId, ShapeObject[]> = {
  lingkaran: [
    { emoji: "⚽", name: "Bola" },
    { emoji: "🍪", name: "Kue kering" },
    { emoji: "🌕", name: "Bulan purnama" },
    { emoji: "🏀", name: "Bola basket" },
  ],
  persegi: [
    { emoji: "🎁", name: "Kado" },
    { emoji: "🪟", name: "Jendela" },
    { emoji: "🧊", name: "Es batu" },
  ],
  segitiga: [
    { emoji: "🍕", name: "Pizza" },
    { emoji: "⛺", name: "Tenda" },
    { emoji: "🚩", name: "Bendera" },
  ],
  "persegi-panjang": [
    { emoji: "🧱", name: "Batu bata" },
    { emoji: "🚪", name: "Pintu" },
    { emoji: "📱", name: "Ponsel" },
    { emoji: "🍫", name: "Cokelat" },
  ],
  bintang: [
    { emoji: "⭐", name: "Bintang di langit" },
    { emoji: "🌟", name: "Bintang bersinar" },
  ],
  hati: [
    { emoji: "❤️", name: "Hati cinta" },
    { emoji: "💖", name: "Hati berkilau" },
  ],
  "belah-ketupat": [
    { emoji: "🪁", name: "Layang-layang" },
    { emoji: "💎", name: "Berlian" },
  ],
};
