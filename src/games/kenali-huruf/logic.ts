import { INITIAL_ITEMS, initialOf, itemsStartingWith, LETTERS, letterOf, similarTo, type Letter } from "@/content/huruf";
import type { ContentItem } from "@/content/items";
import { defaultRng, pick, sample, shuffle, type Rng } from "@/lib/random";

export const ROUNDS = 10;
export const OPTIONS = 4;
/** jumlah gaya huruf yang dipakai di tingkat "Huruf Mirip" */
export const FONT_STYLES = 3;

export type Mode = "hear" | "pair" | "initial" | "similar";

export interface LevelConfig {
  mode: Mode;
}

export const LEVEL_CONFIG: Record<string, LevelConfig> = {
  mudah: { mode: "hear" },
  sedang: { mode: "pair" },
  sulit: { mode: "initial" },
  ahli: { mode: "similar" },
};

export interface Question {
  mode: Mode;
  letter: Letter;
  /** kalimat yang diucapkan di awal soal */
  speech: string;
  /** perintah tertulis */
  ask: string;
  /** huruf besar yang ditampilkan (mode pair), bila ada */
  shown: string | null;
  /** gambar yang ditampilkan (mode initial), bila ada */
  item: ContentItem | null;
  /** benda contoh untuk kalimat "<huruf> untuk <benda>" */
  example: ContentItem | null;
  options: string[];
  answer: string;
  /** huruf besar atau kecil pada pilihan */
  optionCase: "upper" | "lower";
  /** gaya huruf (0..FONT_STYLES-1) */
  fontIdx: number;
}

const casing = (l: Letter, c: "upper" | "lower") => (c === "upper" ? l.upper : l.lower);

const exampleFor = (letter: Letter, rng: Rng): ContentItem | null => {
  const items = itemsStartingWith(letter.upper);
  return items.length ? pick(items, rng) : null;
};

/** Pilih n huruf berbeda dari kumpulan (diacak). */
const pickLetters = (pool: readonly Letter[], n: number, rng: Rng) => sample(pool, n, rng);

function otherLetters(answer: Letter, n: number, rng: Rng): Letter[] {
  return sample(
    LETTERS.filter((l) => l.upper !== answer.upper),
    n,
    rng,
  );
}

function qHear(letter: Letter, rng: Rng): Question {
  const decoys = otherLetters(letter, OPTIONS - 1, rng);
  return {
    mode: "hear",
    letter,
    speech: `Mana huruf ${letter.name}?`,
    ask: `Mana huruf “${letter.name}”?`,
    shown: null,
    item: null,
    example: exampleFor(letter, rng),
    options: shuffle([letter, ...decoys], rng).map((l) => l.upper),
    answer: letter.upper,
    optionCase: "upper",
    fontIdx: 0,
  };
}

function qPair(letter: Letter, rng: Rng): Question {
  const toLower = rng() < 0.5;
  const optionCase = toLower ? "lower" : "upper";
  const decoys = otherLetters(letter, OPTIONS - 1, rng);
  const shown = toLower ? letter.upper : letter.lower;
  return {
    mode: "pair",
    letter,
    speech: toLower ? `Cari huruf kecil untuk huruf besar ${letter.name}` : `Cari huruf besar untuk huruf kecil ${letter.name}`,
    ask: toLower ? "Mana pasangan huruf kecilnya?" : "Mana pasangan huruf besarnya?",
    shown,
    item: null,
    example: exampleFor(letter, rng),
    options: shuffle([letter, ...decoys], rng).map((l) => casing(l, optionCase)),
    answer: casing(letter, optionCase),
    optionCase,
    fontIdx: 0,
  };
}

function qInitial(item: ContentItem, rng: Rng): Question {
  const init = initialOf(item.name)!;
  const letter = letterOf(init)!;
  // pengecoh: huruf yang berbeda dari huruf awal jawaban
  const decoys = otherLetters(letter, OPTIONS - 1, rng);
  return {
    mode: "initial",
    letter,
    speech: `Ini ${item.name}. Huruf apa di depan ${item.name}?`,
    ask: "Huruf apa di depan nama gambar ini?",
    shown: null,
    item,
    example: item,
    options: shuffle([letter, ...decoys], rng).map((l) => l.upper),
    answer: letter.upper,
    optionCase: "upper",
    fontIdx: 0,
  };
}

/** Huruf (kapital) yang punya pasangan mirip, layak jadi jawaban tingkat ahli. */
export const SIMILAR_CANDIDATES: Letter[] = LETTERS.filter((l) => similarTo(l.lower).length > 0);

function qSimilar(letter: Letter, rng: Rng): Question {
  const optionCase = rng() < 0.5 ? "lower" : "upper";
  const alikes = shuffle(similarTo(letter.lower), rng);
  const decoyChars = alikes.slice(0, OPTIONS - 1);
  if (decoyChars.length < OPTIONS - 1) {
    const filler = shuffle(
      LETTERS.filter((l) => l.lower !== letter.lower && !decoyChars.includes(l.lower)),
      rng,
    );
    for (const f of filler) {
      if (decoyChars.length >= OPTIONS - 1) break;
      decoyChars.push(f.lower);
    }
  }
  const decoys = decoyChars.map((c) => letterOf(c)!);
  return {
    mode: "similar",
    letter,
    speech: `Hati-hati, bentuknya mirip. Mana huruf ${letter.name}?`,
    ask: `Hati-hati! Mana huruf “${letter.name}”?`,
    shown: null,
    item: null,
    example: exampleFor(letter, rng),
    options: shuffle([letter, ...decoys], rng).map((l) => casing(l, optionCase)),
    answer: casing(letter, optionCase),
    optionCase,
    fontIdx: Math.floor(rng() * FONT_STYLES),
  };
}

/** Pilih n benda dengan huruf awal berbeda-beda (selama memungkinkan). */
export function pickInitialItems(n: number, rng: Rng): ContentItem[] {
  const byLetter = new Map<string, ContentItem[]>();
  for (const it of INITIAL_ITEMS) {
    const k = initialOf(it.name)!;
    byLetter.set(k, [...(byLetter.get(k) ?? []), it]);
  }
  const letters = sample([...byLetter.keys()], n, rng);
  return letters.map((k) => pick(byLetter.get(k)!, rng));
}

export function buildQuestions(levelId: string, n = ROUNDS, rng: Rng = defaultRng): Question[] {
  const cfg = LEVEL_CONFIG[levelId] ?? LEVEL_CONFIG.mudah;
  switch (cfg.mode) {
    case "hear":
      return pickLetters(LETTERS, n, rng).map((l) => qHear(l, rng));
    case "pair":
      return pickLetters(LETTERS, n, rng).map((l) => qPair(l, rng));
    case "initial":
      return pickInitialItems(n, rng).map((it) => qInitial(it, rng));
    case "similar":
      return pickLetters(SIMILAR_CANDIDATES, n, rng).map((l) => qSimilar(l, rng));
  }
}

/** Kalimat penguat setelah jawaban benar: "<nama huruf> untuk <nama benda>". */
export const exampleSentence = (q: Question): string | null =>
  q.example ? `${q.letter.name} untuk ${q.example.name}` : null;
