import { defaultRng, shuffle, type Rng } from "@/lib/random";
import {
  BASIC,
  COLOR_BY_ID,
  COLORS,
  isSimilar,
  OBJECTS,
  RECIPES,
  type ColorDef,
  type ColorObject,
} from "./data";

export const ROUNDS = 10;

export type QuestionKind = "hear" | "read" | "object" | "mix";

export interface LevelConfig {
  kind: QuestionKind;
  options: number;
  /** warna yang boleh menjadi jawaban/pengecoh */
  pool: readonly ColorDef[];
}

export const LEVEL_CONFIG: Record<string, LevelConfig> = {
  mudah: { kind: "hear", options: 3, pool: BASIC.map((id) => COLOR_BY_ID[id]) },
  sedang: { kind: "read", options: 4, pool: COLORS },
  sulit: { kind: "object", options: 4, pool: COLORS },
  ahli: { kind: "mix", options: 4, pool: COLORS },
};

export interface Question {
  kind: QuestionKind;
  /** kalimat soal (ditulis dan diucapkan) */
  prompt: string;
  answer: ColorDef;
  /** sudah diacak; memuat answer; tanpa duplikat */
  options: ColorDef[];
  object?: ColorObject;
  mix?: { a: ColorDef; b: ColorDef };
  /** kalimat penjelasan jawaban benar */
  explain: string;
}

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Ambil n item dari pool, diulang (diacak per putaran) bila perlu, tanpa item sama berurutan. */
export function cycle<T>(pool: readonly T[], n: number, rng: Rng): T[] {
  const out: T[] = [];
  let last: T | undefined;
  while (out.length < n) {
    const round = shuffle(pool, rng);
    if (round.length > 1 && round[0] === last) round.push(round.shift() as T);
    for (const x of round) if (out.length < n) out.push(x);
    last = out[out.length - 1];
  }
  return out;
}

/** Jawaban + pengecoh yang tidak mirip jawaban. */
export function makeOptions(answer: ColorDef, count: number, pool: readonly ColorDef[], rng: Rng): ColorDef[] {
  const candidates = pool.filter((c) => c.id !== answer.id && !isSimilar(c.id, answer.id));
  const decoys = shuffle(candidates, rng).slice(0, count - 1);
  return shuffle([answer, ...decoys], rng);
}

function base(kind: QuestionKind, cfg: LevelConfig, answer: ColorDef, rng: Rng) {
  return { kind, answer, options: makeOptions(answer, cfg.options, cfg.pool, rng) };
}

export function buildQuestions(levelId: string, n = ROUNDS, rng: Rng = defaultRng): Question[] {
  const cfg = LEVEL_CONFIG[levelId] ?? LEVEL_CONFIG.mudah;

  if (cfg.kind === "hear") {
    return cycle(cfg.pool, n, rng).map((c) => ({
      ...base("hear", cfg, c, rng),
      prompt: `Mana warna ${c.name}?`,
      explain: `Ini warna ${c.name}`,
    }));
  }

  if (cfg.kind === "read") {
    return shuffle(cfg.pool, rng)
      .slice(0, n)
      .map((c) => ({
        ...base("read", cfg, c, rng),
        prompt: "Warna apa ini?",
        explain: `Ini warna ${c.name}`,
      }));
  }

  if (cfg.kind === "object") {
    return shuffle(OBJECTS, rng)
      .slice(0, n)
      .map((o) => {
        const c = COLOR_BY_ID[o.color];
        return {
          ...base("object", cfg, c, rng),
          object: o,
          prompt: `${o.name} berwarna apa?`,
          explain: `${o.name} berwarna ${c.name}`,
        };
      });
  }

  // campur warna: tiap resep muncul dua kali; urutan bahan ditukar pada kemunculan kedua
  const seen = new Set<string>();
  return cycle(RECIPES, n, rng).map((r) => {
    const swap = seen.has(r.result);
    seen.add(r.result);
    const a = COLOR_BY_ID[swap ? r.b : r.a];
    const b = COLOR_BY_ID[swap ? r.a : r.b];
    const result = COLOR_BY_ID[r.result];
    return {
      ...base("mix", cfg, result, rng),
      mix: { a, b },
      prompt: `Kalau ${a.name} dicampur ${b.name}, jadi warna apa?`,
      explain: `${cap(a.name)} dan ${b.name} jadi ${result.name}`,
    };
  });
}
