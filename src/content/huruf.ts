/**
 * KONTEN HURUF: alfabet A–Z, nama huruf (ejaan untuk TTS Indonesia),
 * kelompok huruf yang mirip bentuknya, dan helper huruf awal kata.
 */
import { ITEMS, type ContentItem } from "./items";

export interface Letter {
  upper: string;
  lower: string;
  /** nama huruf dalam ejaan yang dibaca TTS Indonesia */
  name: string;
}

const L = (upper: string, name: string): Letter => ({ upper, lower: upper.toLowerCase(), name });

export const LETTERS: Letter[] = [
  L("A", "a"), L("B", "be"), L("C", "ce"), L("D", "de"), L("E", "e"), L("F", "ef"), L("G", "ge"),
  L("H", "ha"), L("I", "i"), L("J", "je"), L("K", "ka"), L("L", "el"), L("M", "em"), L("N", "en"),
  L("O", "o"), L("P", "pe"), L("Q", "ki"), L("R", "er"), L("S", "es"), L("T", "te"), L("U", "u"),
  L("V", "ve"), L("W", "we"), L("X", "eks"), L("Y", "ye"), L("Z", "zet"),
];

export const letterOf = (ch: string): Letter | undefined => {
  const u = ch.toUpperCase();
  return LETTERS.find((l) => l.upper === u);
};

/** Kelompok huruf (huruf kecil) yang sering membingungkan anak. */
export const SIMILAR_GROUPS: string[][] = [
  ["b", "d", "p", "q"],
  ["m", "n", "w"],
  ["u", "n", "v"],
  ["g", "q", "y"],
  ["i", "l", "j"],
  ["o", "c", "e"],
  ["h", "n", "k"],
  ["f", "t"],
  ["a", "e", "o"],
  ["s", "z"],
];

/** Huruf-huruf (huruf kecil) yang mirip dengan `ch`, tanpa pengulangan. */
export function similarTo(ch: string): string[] {
  const c = ch.toLowerCase();
  const out = new Set<string>();
  for (const g of SIMILAR_GROUPS) if (g.includes(c)) for (const x of g) if (x !== c) out.add(x);
  return [...out];
}

/** Huruf awal (kapital) dari nama benda; null bila tidak diawali huruf A–Z. */
export function initialOf(name: string): string | null {
  const m = name.trim().charAt(0);
  return /^[A-Za-z]$/.test(m) ? m.toUpperCase() : null;
}

/** Benda bernama satu kata yang bisa dipakai untuk "huruf awal". */
export const INITIAL_ITEMS: ContentItem[] = ITEMS.filter((it) => /^[A-Za-z]+$/.test(it.name));

export const itemsStartingWith = (letter: string): ContentItem[] =>
  INITIAL_ITEMS.filter((it) => initialOf(it.name) === letter.toUpperCase());
