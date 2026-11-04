import { isSpellable, itemsFor, type ContentItem } from "@/content/items";
import { defaultRng, shuffle, type Rng } from "@/lib/random";

export const ROUNDS = 10;

export interface LevelConfig {
  min: number;
  max: number;
  /** tampilkan huruf samar sebagai petunjuk di kotak */
  ghost: boolean;
  /** jumlah huruf jebakan */
  extra: number;
}

export const LEVEL_CONFIG: Record<string, LevelConfig> = {
  mudah: { min: 3, max: 5, ghost: true, extra: 0 },
  sedang: { min: 5, max: 6, ghost: false, extra: 0 },
  sulit: { min: 6, max: 9, ghost: false, extra: 3 },
};

export interface Word {
  item: ContentItem;
  /** HURUF BESAR */
  text: string;
}

/** Pilih n kata yang panjangnya paling dekat dengan rentang tingkat. */
export function pickWords(category: string, cfg: LevelConfig, n = ROUNDS, rng: Rng = defaultRng): Word[] {
  const all = itemsFor(category)
    .filter(isSpellable)
    .map((item) => ({ item, text: item.name.toUpperCase() }));
  const dist = (w: Word) => (w.text.length < cfg.min ? cfg.min - w.text.length : w.text.length > cfg.max ? w.text.length - cfg.max : 0);
  const chosen = shuffle(all, rng)
    .sort((a, b) => dist(a) - dist(b))
    .slice(0, n);
  return shuffle(chosen, rng);
}

export interface Tile {
  /** id unik agar huruf kembar tidak tertukar */
  id: number;
  ch: string;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Susun huruf-huruf acak (ditambah huruf jebakan yang tidak ada di kata). */
export function buildTray(word: string, extra: number, rng: Rng = defaultRng): Tile[] {
  const letters = word.split("");
  const pool = ALPHABET.split("").filter((c) => !word.includes(c));
  const decoys = shuffle(pool, rng).slice(0, extra);
  return shuffle([...letters, ...decoys], rng).map((ch, id) => ({ id, ch }));
}
