import { SENTENCES, type Sentence } from "@/content/kalimat";
import { defaultRng, sample, shuffle, type Rng } from "@/lib/random";

export const ROUNDS = 10;

export type Mode = "pick" | "fill" | "arrange";

export interface LevelConfig {
  mode: Mode;
  /** rentang jumlah kata kalimat */
  minWords: number;
  maxWords: number;
  /** jumlah pilihan (gambar atau kata); tidak dipakai pada "arrange" */
  options: number;
}

export const LEVEL_CONFIG: Record<string, LevelConfig> = {
  mudah: { mode: "pick", minWords: 2, maxWords: 3, options: 3 },
  sedang: { mode: "fill", minWords: 3, maxWords: 4, options: 3 },
  sulit: { mode: "pick", minWords: 4, maxWords: 5, options: 4 },
  ahli: { mode: "arrange", minWords: 3, maxWords: 5, options: 0 },
};

export interface Tile {
  id: number;
  word: string;
}

export interface Question {
  sentence: Sentence;
  mode: Mode;
  /** mode "pick": pilihan adegan (sudah diacak, memuat jawaban) */
  options: Sentence[];
  /** mode "fill": indeks kata yang dikosongkan, dan pilihan katanya */
  blankIndex: number;
  fillOptions: string[];
  /** mode "arrange": kata-kata acak */
  tiles: Tile[];
}

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

export function inRange(s: Sentence, cfg: LevelConfig) {
  return s.words.length >= cfg.minWords && s.words.length <= cfg.maxWords;
}

export function pickSentences(cfg: LevelConfig, n = ROUNDS, rng: Rng = defaultRng): Sentence[] {
  const pool = SENTENCES.filter((s) => inRange(s, cfg));
  const target = (cfg.minWords + cfg.maxWords) / 2;
  const base = pool.length >= n ? pool : [...pool, ...SENTENCES.filter((s) => !inRange(s, cfg)).sort((a, b) => Math.abs(a.words.length - target) - Math.abs(b.words.length - target))];
  return sample(base.slice(0, Math.max(n, pool.length)), n, rng);
}

/** Pilihan adegan: jawaban + pengecoh (diutamakan dari tingkat panjang yang sama). */
export function buildPickOptions(answer: Sentence, cfg: LevelConfig, rng: Rng = defaultRng): Sentence[] {
  const others = SENTENCES.filter((s) => s.id !== answer.id && s.scene !== answer.scene);
  const near = shuffle(others.filter((s) => inRange(s, cfg)), rng);
  const far = shuffle(others.filter((s) => !inRange(s, cfg)), rng);
  const decoys = [...near, ...far].slice(0, cfg.options - 1);
  return shuffle([answer, ...decoys], rng);
}

/** Soal isian: kata inti dikosongkan; pengecoh = kata inti kalimat lain yang tidak ada di kalimat ini. */
export function buildFill(answer: Sentence, count: number, rng: Rng = defaultRng): { blankIndex: number; options: string[] } {
  const blankIndex = answer.words.findIndex((w) => w.toLowerCase() === answer.keyWord.toLowerCase());
  const correct = answer.words[blankIndex];
  const inSentence = new Set(answer.words.map((w) => w.toLowerCase()));
  const seen = new Set<string>([correct.toLowerCase()]);
  const decoys: string[] = [];
  for (const s of shuffle(SENTENCES, rng)) {
    const k = s.keyWord.toLowerCase();
    if (s.id === answer.id || inSentence.has(k) || seen.has(k)) continue;
    seen.add(k);
    decoys.push(blankIndex === 0 ? cap(k) : k);
    if (decoys.length >= count - 1) break;
  }
  return { blankIndex, options: shuffle([correct, ...decoys], rng) };
}

/** Kata acak sebagai tile; urutannya tidak boleh sama dengan kalimat asli. */
export function buildTiles(answer: Sentence, rng: Rng = defaultRng): Tile[] {
  const tiles = answer.words.map((word, id) => ({ id, word }));
  let out = shuffle(tiles, rng);
  for (let i = 0; i < 10 && out.every((t, k) => t.id === k); i++) out = shuffle(tiles, rng);
  if (out.every((t, k) => t.id === k) && out.length > 1) out = [out[1], out[0], ...out.slice(2)];
  return out;
}

export function buildQuestion(sentence: Sentence, cfg: LevelConfig, rng: Rng = defaultRng): Question {
  const q: Question = { sentence, mode: cfg.mode, options: [], blankIndex: -1, fillOptions: [], tiles: [] };
  if (cfg.mode === "pick") q.options = buildPickOptions(sentence, cfg, rng);
  else if (cfg.mode === "fill") {
    const f = buildFill(sentence, cfg.options, rng);
    q.blankIndex = f.blankIndex;
    q.fillOptions = f.options;
  } else q.tiles = buildTiles(sentence, rng);
  return q;
}

export function buildQuestions(cfg: LevelConfig, rng: Rng = defaultRng, n = ROUNDS): Question[] {
  return pickSentences(cfg, n, rng).map((s) => buildQuestion(s, cfg, rng));
}
