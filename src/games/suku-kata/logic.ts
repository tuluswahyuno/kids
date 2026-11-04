import { ALL_SYLLABLES, SUKU_WORDS, type SukuWord } from "@/content/suku-kata";
import { defaultRng, randInt, sample, shuffle, type Rng } from "@/lib/random";

export const ROUNDS = 10;
export const OPTIONS = 4;

export type Mode = "hear" | "build";

export interface LevelConfig {
  mode: Mode;
  /** saring kata yang boleh dipakai (hanya mode build) */
  filter?: (w: SukuWord) => boolean;
  /** jumlah suku kata pengecoh [min, maks] */
  extra: [number, number];
}

export const LEVEL_CONFIG: Record<string, LevelConfig> = {
  mudah: { mode: "hear", extra: [0, 0] },
  sedang: { mode: "build", filter: (w) => w.group === "terbuka" && w.syllables.length === 2, extra: [0, 0] },
  sulit: { mode: "build", filter: (w) => w.syllables.length === 3, extra: [1, 2] },
  ahli: { mode: "build", filter: (w) => w.group === "tertutup", extra: [1, 2] },
};

export interface HearQuestion {
  kind: "hear";
  /** suku kata yang diucapkan, sekaligus jawaban benar */
  answer: string;
  options: string[];
}

export interface Tile {
  /** id unik agar suku kata kembar (su-su) tidak tertukar */
  id: number;
  text: string;
}

export interface BuildQuestion {
  kind: "build";
  word: SukuWord;
  tiles: Tile[];
}

export type Question = HearQuestion | BuildQuestion;

/** Pengecoh untuk suku kata: beda satu konsonan atau satu vokal, tanpa jawaban. */
export function syllableOptions(answer: string, rng: Rng = defaultRng): string[] {
  const c = answer[0];
  const v = answer[1];
  const sameConsonant = ALL_SYLLABLES.filter((s) => s[0] === c && s !== answer);
  const sameVowel = ALL_SYLLABLES.filter((s) => s[1] === v && s !== answer);
  const a = sample(sameConsonant, 1, rng)[0];
  const b = sample(sameVowel, 1, rng)[0];
  const chosen = new Set<string>([a, b]);
  const rest = shuffle([...sameConsonant, ...sameVowel].filter((s) => !chosen.has(s)), rng);
  for (const s of rest) {
    if (chosen.size >= OPTIONS - 1) break;
    chosen.add(s);
  }
  return shuffle([answer, ...chosen], rng);
}

/** Susun nampan: semua suku kata kata itu + pengecoh yang bukan suku kata kata itu. */
export function buildTiles(word: SukuWord, extra: number, rng: Rng = defaultRng): Tile[] {
  const own = new Set(word.syllables);
  // kolam pengecoh: suku kata dari tabel dan dari kata lain, bukan milik kata ini
  const pool = [...new Set([...ALL_SYLLABLES, ...SUKU_WORDS.flatMap((w) => w.syllables)])].filter((s) => !own.has(s));
  const decoys = sample(pool, extra, rng);
  let tiles = shuffle([...word.syllables, ...decoys], rng);
  // jangan biarkan urutan acak kebetulan sudah benar (tanpa pengecoh)
  if (extra === 0 && tiles.join("") === word.word) tiles = tiles.slice().reverse();
  return tiles.map((text, id) => ({ id, text }));
}

export function buildQuestions(levelId: string, n = ROUNDS, rng: Rng = defaultRng): Question[] {
  const cfg = LEVEL_CONFIG[levelId] ?? LEVEL_CONFIG.mudah;
  if (cfg.mode === "hear") {
    return sample(ALL_SYLLABLES, n, rng).map((answer) => ({
      kind: "hear" as const,
      answer,
      options: syllableOptions(answer, rng),
    }));
  }
  const pool = SUKU_WORDS.filter(cfg.filter ?? (() => true));
  return sample(pool, n, rng).map((word) => ({
    kind: "build" as const,
    word,
    tiles: buildTiles(word, randInt(cfg.extra[0], cfg.extra[1], rng), rng),
  }));
}

/** Kalimat penutup setelah kata tersusun: "ba, ju. baju". */
export const spokenWord = (w: SukuWord) => `${w.syllables.join(", ")}. ${w.word}`;
