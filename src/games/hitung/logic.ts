import { ITEMS, numberWord, type ContentItem } from "@/content/items";
import { defaultRng, pick, randInt, shuffle, type Rng } from "@/lib/random";

export const ROUNDS = 10;

export type Kind = "count" | "add" | "sub";

export interface LevelConfig {
  /** count = hitung gambar; add = tambah; mix = tambah atau kurang */
  type: "count" | "add" | "mix";
  /** bilangan terbesar (jawaban maupun pilihan) */
  max: number;
  /** jumlah pilihan jawaban */
  options: number;
}

export const LEVEL_CONFIG: Record<string, LevelConfig> = {
  mudah: { type: "count", max: 5, options: 3 },
  sedang: { type: "count", max: 10, options: 4 },
  sulit: { type: "add", max: 10, options: 4 },
  ahli: { type: "mix", max: 20, options: 4 },
};

export interface Question {
  kind: Kind;
  /** benda yang digambar (diambil dari konten bersama) */
  thing: ContentItem;
  a: number;
  b: number;
  answer: number;
  /** kalimat yang diucapkan */
  say: string;
  /** teks soal di layar */
  text: string;
  options: number[];
}

/**
 * Pilihan jawaban: jawaban benar + pengecoh yang berbeda-beda, semuanya di [min, max].
 * Pengecoh diutamakan yang dekat dengan jawaban (±3), sisanya diisi dari seluruh rentang.
 */
export function makeOptions(answer: number, min: number, max: number, count: number, rng: Rng = defaultRng): number[] {
  const near: number[] = [];
  for (let d = -3; d <= 3; d++) {
    const v = answer + d;
    if (d !== 0 && v >= min && v <= max) near.push(v);
  }
  const far: number[] = [];
  for (let v = min; v <= max; v++) if (v !== answer && !near.includes(v)) far.push(v);
  const decoys = [...shuffle(near, rng), ...shuffle(far, rng)].slice(0, count - 1);
  return shuffle([answer, ...decoys], rng);
}

export function makeQuestion(cfg: LevelConfig, rng: Rng = defaultRng): Question {
  const thing = pick(ITEMS, rng);
  const name = thing.name.toLowerCase();
  const kind: Kind = cfg.type === "mix" ? (rng() < 0.5 ? "add" : "sub") : cfg.type;

  if (kind === "count") {
    const n = randInt(1, cfg.max, rng);
    return {
      kind,
      thing,
      a: n,
      b: 0,
      answer: n,
      say: `Ada berapa ${name}?`,
      text: `Ada berapa ${name}?`,
      options: makeOptions(n, 1, cfg.max, cfg.options, rng),
    };
  }

  if (kind === "add") {
    const total = randInt(2, cfg.max, rng);
    const a = randInt(1, total - 1, rng);
    const b = total - a;
    return {
      kind,
      thing,
      a,
      b,
      answer: total,
      say: `${numberWord(a)} tambah ${numberWord(b)} sama dengan berapa?`,
      text: `${a} + ${b} = ?`,
      options: makeOptions(total, 1, cfg.max, cfg.options, rng),
    };
  }

  const a = randInt(2, cfg.max, rng);
  const b = randInt(1, a - 1, rng);
  return {
    kind: "sub",
    thing,
    a,
    b,
    answer: a - b,
    say: `${numberWord(a)} kurang ${numberWord(b)} sama dengan berapa?`,
    text: `${a} − ${b} = ?`,
    options: makeOptions(a - b, 1, cfg.max, cfg.options, rng),
  };
}

export interface Group {
  emoji: string;
  count: number;
}

export type Stage =
  | { kind: "objects"; groups: Group[]; op: "+" | "−" | null; countable: boolean }
  | { kind: "text" };

/** Gambar hanya dipakai bila jumlahnya muat (<= 10); selain itu tampil sebagai persamaan. */
export function stageFor(q: Question): Stage {
  const e = q.thing.emoji;
  if (q.kind === "count") return { kind: "objects", groups: [{ emoji: e, count: q.a }], op: null, countable: true };
  if (q.kind === "add" && q.a + q.b <= 10)
    return { kind: "objects", groups: [{ emoji: e, count: q.a }, { emoji: e, count: q.b }], op: "+", countable: false };
  if (q.kind === "sub" && q.a <= 10)
    return { kind: "objects", groups: [{ emoji: e, count: q.a }, { emoji: "❌", count: q.b }], op: "−", countable: false };
  return { kind: "text" };
}
