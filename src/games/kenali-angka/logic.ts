import { ITEMS, numberWord } from "@/content/items";
import { defaultRng, pick, randInt, sample, shuffle, type Rng } from "@/lib/random";

export const ROUNDS = 10;

export type ChoiceKind = "word" | "dots" | "next" | "prev" | "missing";
export type Dir = "asc" | "desc";

export interface LevelConfig {
  /** bilangan terkecil & terbesar yang dipakai (jawaban & pilihan) */
  min: number;
  max: number;
  /** jenis soal pilihan; kosong bila mode urutan */
  kinds: ChoiceKind[];
  /** jumlah pilihan jawaban */
  options: number;
  /** mode urutkan angka */
  order?: boolean;
}

export const LEVEL_CONFIG: Record<string, LevelConfig> = {
  mudah: { min: 1, max: 5, kinds: ["word", "dots"], options: 3 },
  sedang: { min: 1, max: 10, kinds: ["word", "dots", "next", "prev", "missing"], options: 3 },
  sulit: { min: 11, max: 20, kinds: ["word", "dots", "next", "prev", "missing"], options: 4 },
  ahli: { min: 1, max: 20, kinds: [], options: 0, order: true },
};

export interface ChoiceQuestion {
  type: "choice";
  kind: ChoiceKind;
  answer: number;
  /** pilihan berupa lambang angka; pada jenis "dots" pilihan = kelompok benda dengan jumlah tsb */
  options: number[];
  /** hanya "dots": emoji benda yang digambar */
  emoji?: string;
  /** hanya "next"/"prev": angka acuan */
  ref?: number;
  /** hanya "missing": deretan; null = yang hilang */
  seq?: (number | null)[];
  /** hanya "word": kata angka yang tampil */
  word?: string;
  say: string;
  text: string;
  /** kalimat jawaban benar (diucapkan & ditulis) */
  reveal: string;
}

export interface OrderQuestion {
  type: "order";
  dir: Dir;
  numbers: number[];
  sorted: number[];
  say: string;
  text: string;
  reveal: string;
}

export type Question = ChoiceQuestion | OrderQuestion;

/** Pilihan angka: jawaban + pengecoh unik di [min, max], diutamakan yang dekat. */
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

export function makeChoice(kind: ChoiceKind, cfg: LevelConfig, rng: Rng = defaultRng): ChoiceQuestion {
  const { min, max } = cfg;
  const base = { type: "choice" as const, kind };
  const opts = (answer: number) => makeOptions(answer, min, max, cfg.options, rng);

  if (kind === "word") {
    const n = randInt(min, max, rng);
    return {
      ...base,
      answer: n,
      options: opts(n),
      word: numberWord(n),
      say: `Mana angka ${numberWord(n)}?`,
      text: `Mana angka "${numberWord(n)}"?`,
      reveal: `${numberWord(n)} ditulis ${n}`,
    };
  }
  if (kind === "dots") {
    const n = randInt(min, max, rng);
    return {
      ...base,
      answer: n,
      options: opts(n),
      emoji: pick(ITEMS, rng).emoji,
      say: `Angka ${numberWord(n)}. Mana kelompok yang banyaknya ${numberWord(n)}?`,
      text: `Mana kelompok yang banyaknya ${n}?`,
      reveal: `Banyaknya ${numberWord(n)}`,
    };
  }
  if (kind === "next") {
    const r = randInt(min, max - 1, rng);
    return {
      ...base,
      answer: r + 1,
      options: opts(r + 1),
      ref: r,
      say: `Angka apa setelah ${numberWord(r)}?`,
      text: `Angka apa setelah ${r}?`,
      reveal: `Setelah ${numberWord(r)} adalah ${numberWord(r + 1)}`,
    };
  }
  if (kind === "prev") {
    const r = randInt(min + 1, max, rng);
    return {
      ...base,
      answer: r - 1,
      options: opts(r - 1),
      ref: r,
      say: `Angka apa sebelum ${numberWord(r)}?`,
      text: `Angka apa sebelum ${r}?`,
      reveal: `Sebelum ${numberWord(r)} adalah ${numberWord(r - 1)}`,
    };
  }
  // missing: empat bilangan berurutan, satu hilang
  const start = randInt(min, max - 3, rng);
  const hole = randInt(0, 3, rng);
  const seq: (number | null)[] = [0, 1, 2, 3].map((i) => (i === hole ? null : start + i));
  const answer = start + hole;
  return {
    ...base,
    answer,
    options: opts(answer),
    seq,
    say: `Angka berapa yang hilang? ${seq.map((v) => (v === null ? "berapa" : numberWord(v))).join(", ")}`,
    text: "Angka berapa yang hilang?",
    reveal: `Yang hilang adalah ${numberWord(answer)}`,
  };
}

export function makeOrder(dir: Dir, min: number, max: number, rng: Rng = defaultRng): OrderQuestion {
  const size = randInt(4, 5, rng);
  const pool = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const numbers = sample(pool, size, rng);
  const asc = [...numbers].sort((a, b) => a - b);
  const sorted = dir === "asc" ? asc : [...asc].reverse();
  const how = dir === "asc" ? "dari yang terkecil" : "dari yang terbesar";
  return {
    type: "order",
    dir,
    numbers,
    sorted,
    say: `Ketuk angkanya berurutan, ${how}.`,
    text: `Ketuk angkanya berurutan, ${how}`,
    reveal: `Urutannya ${sorted.map(numberWord).join(", ")}`,
  };
}

const keyOf = (q: Question) =>
  q.type === "order" ? `o${q.numbers.join(",")}` : `${q.kind}:${q.answer}:${q.ref ?? ""}:${q.seq?.join(",") ?? ""}`;

/** Satu putaran penuh: 10 soal, jenis soal digilir agar bervariasi, tanpa soal kembar bila bisa. */
export function buildQuestions(cfg: LevelConfig, rng: Rng = defaultRng): Question[] {
  const out: Question[] = [];
  const seen = new Set<string>();
  if (cfg.order) {
    // separuh naik, separuh turun, urutan diacak
    const dirs = shuffle<Dir>(["asc", "asc", "asc", "asc", "asc", "desc", "desc", "desc", "desc", "desc"], rng);
    for (const dir of dirs) {
      let q = makeOrder(dir, cfg.min, cfg.max, rng);
      for (let t = 0; t < 20 && seen.has(keyOf(q)); t++) q = makeOrder(dir, cfg.min, cfg.max, rng);
      seen.add(keyOf(q));
      out.push(q);
    }
    return out;
  }
  const kinds: ChoiceKind[] = [];
  while (kinds.length < ROUNDS) kinds.push(...shuffle(cfg.kinds, rng));
  for (const kind of kinds.slice(0, ROUNDS)) {
    let q = makeChoice(kind, cfg, rng);
    for (let t = 0; t < 20 && seen.has(keyOf(q)); t++) q = makeChoice(kind, cfg, rng);
    seen.add(keyOf(q));
    out.push(q);
  }
  return out;
}
