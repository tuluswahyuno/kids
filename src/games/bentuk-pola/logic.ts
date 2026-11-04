import { defaultRng, pick, randInt, sample, shuffle, type Rng } from "@/lib/random";
import {
  COLOR,
  COLOR_IDS,
  confusable,
  DEFAULT_COLOR,
  FILL_COLORS,
  FILL_NAME,
  FILL_OF,
  OBJECTS,
  SHAPE_IDS,
  SHAPE_NAME,
  type ColorId,
  type Fill,
  type ShapeId,
} from "./data";

export const ROUNDS = 10;

export interface Token {
  shape: ShapeId;
  color: ColorId;
  fill: Fill;
}

export const tokenKey = (t: Token) => `${t.shape}:${t.color}:${t.fill}`;

export const tokenLabel = (t: Token) =>
  [SHAPE_NAME[t.shape], COLOR[t.color].name, FILL_NAME[t.fill]].filter(Boolean).join(" ");

export type QuestionKind = "name" | "object" | "same" | "pattern";

export interface Opt {
  id: string;
  /** label aksesibilitas (dibaca pembaca layar) */
  label: string;
  token?: Token;
  /** skala gambar bentuk 0..1 (soal "bentuk yang sama") */
  scale?: number;
  emoji?: string;
  /** tulisan di tombol */
  text?: string;
}

export interface Question {
  kind: QuestionKind;
  prompt: string;
  /** bentuk besar yang ditampilkan (soal name/object/same) */
  target?: Token;
  /** urutan pola; null = bagian yang hilang ("?") */
  sequence?: (Token | null)[];
  /** huruf pola per posisi, mis. "AABAABA" (hanya soal pola) */
  pattern?: string;
  /** indeks bagian yang hilang pada sequence */
  blank?: number;
  options: Opt[];
  answerId: string;
  /** kalimat penjelasan jawaban benar (ditulis & diucapkan) */
  explain: string;
}

export type LevelKind = "name" | "mixed" | "pattern";

export interface LevelConfig {
  kind: LevelKind;
  patterns?: string[];
  blank?: "end" | "middle";
}

export const LEVEL_CONFIG: Record<string, LevelConfig> = {
  mudah: { kind: "name" },
  sedang: { kind: "mixed" },
  sulit: { kind: "pattern", patterns: ["AB", "AAB", "ABB"], blank: "end" },
  ahli: { kind: "pattern", patterns: ["ABC", "ABBA", "ABAC"], blank: "middle" },
};

/** Ambil n item dari pool dengan mengulang (diacak per putaran), tanpa item sama berurutan. */
export function cycle<T>(pool: readonly T[], n: number, rng: Rng): T[] {
  const out: T[] = [];
  let last: T | undefined;
  while (out.length < n) {
    const round = shuffle(pool, rng);
    if (round.length > 1 && round[0] === last) round.push(round.shift() as T);
    for (const x of round) {
      if (out.length < n) out.push(x);
    }
    last = out[out.length - 1];
  }
  return out;
}

/** Pilih k bentuk berbeda yang tidak saling mudah tertukar; `base` sudah terpilih (tidak ikut dikembalikan). */
function pickShapes(k: number, rng: Rng, base: readonly ShapeId[] = []): ShapeId[] {
  const chosen: ShapeId[] = [...base];
  for (const s of shuffle(SHAPE_IDS, rng)) {
    if (chosen.length >= base.length + k) break;
    if (chosen.includes(s) || chosen.some((c) => confusable(c, s))) continue;
    chosen.push(s);
  }
  return chosen.slice(base.length);
}

const solid = (shape: ShapeId, color: ColorId = DEFAULT_COLOR[shape]): Token => ({ shape, color, fill: "solid" });

/* ------------------------------ tingkat mudah ------------------------------ */

export function buildNameQuestions(n: number, rng: Rng): Question[] {
  return cycle(SHAPE_IDS, n, rng).map((shape) => {
    const color = pick(COLOR_IDS, rng);
    const decoys = pickShapes(2, rng, [shape]);
    const options: Opt[] = shuffle([shape, ...decoys], rng).map((s) => ({
      id: s,
      label: SHAPE_NAME[s],
      text: SHAPE_NAME[s],
    }));
    return {
      kind: "name" as const,
      prompt: "Bentuk apa ini?",
      target: solid(shape, color),
      options,
      answerId: shape,
      explain: `Ini ${SHAPE_NAME[shape].toLowerCase()}`,
    };
  });
}

/* ------------------------------ tingkat sedang ------------------------------ */

function buildObjectQuestion(shape: ShapeId, rng: Rng): Question {
  const right = pick(OBJECTS[shape], rng);
  const others = shuffle(
    SHAPE_IDS.filter((s) => s !== shape && !confusable(s, shape)),
    rng,
  ).slice(0, 2);
  const decoys = others.map((s) => pick(OBJECTS[s], rng));
  const options: Opt[] = shuffle([right, ...decoys], rng).map((o) => ({
    id: o.emoji,
    label: o.name,
    emoji: o.emoji,
    text: o.name,
  }));
  return {
    kind: "object",
    prompt: "Benda apa yang bentuknya seperti ini?",
    target: solid(shape, pick(COLOR_IDS, rng)),
    options,
    answerId: right.emoji,
    explain: `${right.name} bentuknya seperti ${SHAPE_NAME[shape].toLowerCase()}`,
  };
}

const SCALES = [0.7, 0.85, 1];

function buildSameQuestion(shape: ShapeId, rng: Rng): Question {
  const targetColor = pick(COLOR_IDS, rng);
  const otherColors = COLOR_IDS.filter((c) => c !== targetColor);
  const decoyShapes = pickShapes(2, rng, [shape]);
  const scales = shuffle(SCALES, rng);
  const answerColor = pick(otherColors, rng);
  // satu pengecoh sengaja berwarna sama dengan soal: warna bukan penentu bentuk
  const decoyColors = [targetColor, pick(otherColors, rng)];
  const raw: Opt[] = [
    { id: shape, label: tokenLabel(solid(shape, answerColor)), token: solid(shape, answerColor), scale: scales[0] },
    ...decoyShapes.map((s, i) => ({
      id: s,
      label: tokenLabel(solid(s, decoyColors[i])),
      token: solid(s, decoyColors[i]),
      scale: scales[i + 1],
    })),
  ];
  return {
    kind: "same",
    prompt: "Mana bentuk yang sama?",
    target: solid(shape, targetColor),
    options: shuffle(raw, rng),
    answerId: shape,
    explain: `Bentuk yang sama adalah ${SHAPE_NAME[shape].toLowerCase()}`,
  };
}

export function buildMixedQuestions(n: number, rng: Rng): Question[] {
  const shapes = cycle(SHAPE_IDS, n, rng);
  const kinds = shuffle(
    Array.from({ length: n }, (_, i) => (i % 2 === 0 ? "object" : "same")),
    rng,
  );
  return shapes.map((s, i) => (kinds[i] === "object" ? buildObjectQuestion(s, rng) : buildSameQuestion(s, rng)));
}

/* ------------------------------ tingkat pola ------------------------------ */

export function repsFor(pattern: string): number {
  return pattern.length === 2 || pattern === "ABC" ? 3 : 2;
}

export function buildPatternQuestion(pattern: string, blankAt: "end" | "middle", rng: Rng): Question {
  const letters = Array.from(new Set(pattern.split("")));
  const byShape = rng() < 0.5;
  const symbols: Record<string, Token> = {};
  let extras: Token[] = [];

  if (byShape) {
    const shapes = pickShapes(letters.length, rng);
    letters.forEach((l, i) => (symbols[l] = solid(shapes[i])));
    extras = pickShapes(4 - letters.length, rng, shapes).map((s) => solid(s));
  } else {
    const shape = pick(SHAPE_IDS, rng);
    const cols = sample(FILL_COLORS, letters.length, rng);
    const make = (c: ColorId): Token => ({ shape, color: c, fill: FILL_OF[c] ?? "solid" });
    letters.forEach((l, i) => (symbols[l] = make(cols[i])));
    extras = shuffle(
      FILL_COLORS.filter((c) => !cols.includes(c)),
      rng,
    )
      .slice(0, 4 - letters.length)
      .map(make);
  }

  const reps = repsFor(pattern);
  const baseLen = pattern.length * reps;
  const len = blankAt === "end" ? baseLen + 1 : baseLen;
  const blank = blankAt === "end" ? len - 1 : randInt(1, len - 2, rng);
  const full = Array.from({ length: len }, (_, i) => symbols[pattern[i % pattern.length]]);
  const sequence: (Token | null)[] = full.map((t, i) => (i === blank ? null : t));
  const answer = full[blank];

  const others = letters.map((l) => symbols[l]).filter((t) => tokenKey(t) !== tokenKey(answer));
  const options: Opt[] = shuffle([answer, ...others, ...extras], rng).map((t) => ({
    id: tokenKey(t),
    label: tokenLabel(t),
    token: t,
  }));

  return {
    kind: "pattern",
    prompt:
      blankAt === "end"
        ? "Lanjutkan polanya! Gambar apa berikutnya?"
        : "Ada gambar yang hilang. Gambar apa yang cocok?",
    sequence,
    pattern: Array.from({ length: len }, (_, i) => pattern[i % pattern.length]).join(""),
    blank,
    options,
    answerId: tokenKey(answer),
    explain: `Jawabannya ${tokenLabel(answer).toLowerCase()}`,
  };
}

export function buildQuestions(levelId: string, n = ROUNDS, rng: Rng = defaultRng): Question[] {
  const cfg = LEVEL_CONFIG[levelId] ?? LEVEL_CONFIG.mudah;
  if (cfg.kind === "name") return buildNameQuestions(n, rng);
  if (cfg.kind === "mixed") return buildMixedQuestions(n, rng);
  return cycle(cfg.patterns ?? ["AB"], n, rng).map((p) => buildPatternQuestion(p, cfg.blank ?? "end", rng));
}
