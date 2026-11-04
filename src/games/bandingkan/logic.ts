import { ITEMS, numberWord, type ContentItem } from "@/content/items";
import { defaultRng, pick, randInt, sample, shuffle, type Rng } from "@/lib/random";

export const ROUNDS = 10;

export type Mode = "items" | "numbers" | "calc";
export type Ask = "more" | "less";
export type Answer = "left" | "right" | "same";

export interface LevelConfig {
  mode: Mode;
  min: number;
  max: number;
  /** selisih minimum bila jumlahnya berbeda */
  minDiff: number;
  /** perintah yang mungkin muncul */
  asks: Ask[];
  /** berapa soal (dari 10) yang jawabannya "sama" */
  sameCount: number;
}

export const LEVEL_CONFIG: Record<string, LevelConfig> = {
  mudah: { mode: "items", min: 1, max: 8, minDiff: 3, asks: ["more"], sameCount: 0 },
  sedang: { mode: "items", min: 1, max: 10, minDiff: 2, asks: ["more", "less"], sameCount: 2 },
  sulit: { mode: "numbers", min: 1, max: 20, minDiff: 2, asks: ["more", "less"], sameCount: 2 },
  ahli: { mode: "calc", min: 1, max: 10, minDiff: 1, asks: ["more"], sameCount: 2 },
};

export interface Side {
  value: number;
  /** items: benda yang digambar */
  item?: ContentItem;
  /** calc: bentuk soal, mis. "3 + 2" atau "4" */
  expr?: string;
  /** calc: ucapan, mis. "tiga tambah dua" */
  exprSay?: string;
}

export interface Question {
  mode: Mode;
  ask: Ask;
  left: Side;
  right: Side;
  answer: Answer;
  /** tombol "Sama ..." ditampilkan */
  hasSame: boolean;
  say: string;
  text: string;
  sameLabel: string;
  /** kalimat hasil setelah menjawab */
  reveal: string;
}

export const compareValues = (l: number, r: number, ask: Ask): Answer => {
  if (l === r) return "same";
  const leftBigger = l > r;
  return (ask === "more") === leftBigger ? "left" : "right";
};

function pickPair(cfg: LevelConfig, same: boolean, rng: Rng): [number, number] {
  const a = randInt(cfg.min, cfg.max, rng);
  if (same) return [a, a];
  const cands: number[] = [];
  for (let v = cfg.min; v <= cfg.max; v++) if (Math.abs(v - a) >= cfg.minDiff) cands.push(v);
  return [a, pick(cands, rng)];
}

function makeSide(value: number, plain: boolean, rng: Rng): Side {
  if (plain) return { value, expr: String(value), exprSay: numberWord(value) };
  const canAdd = value >= 2;
  const canSub = value <= 9;
  const useAdd = canAdd && (!canSub || rng() < 0.5);
  if (useAdd) {
    const x = randInt(1, value - 1, rng);
    const y = value - x;
    return { value, expr: `${x} + ${y}`, exprSay: `${numberWord(x)} tambah ${numberWord(y)}` };
  }
  const y = randInt(1, 10 - value, rng);
  const x = value + y;
  return { value, expr: `${x} − ${y}`, exprSay: `${numberWord(x)} kurang ${numberWord(y)}` };
}

const WORDS: Record<Mode, Record<Ask, string>> = {
  items: { more: "lebih banyak", less: "lebih sedikit" },
  numbers: { more: "lebih besar", less: "lebih kecil" },
  calc: { more: "lebih besar", less: "lebih kecil" },
};

function describe(q: { mode: Mode; left: Side; right: Side }): string {
  const { left: l, right: r, mode } = q;
  const w = mode === "items" ? ["banyak", "lebih banyak", "sedikit"] : ["besar", "lebih besar", "kecil"];
  if (mode === "calc") {
    const head = `${l.expr} sama dengan ${l.value}. ${r.expr} sama dengan ${r.value}. `;
    if (l.value === r.value) return head + `Sama ${w[0]}.`;
    const hi = Math.max(l.value, r.value);
    const lo = Math.min(l.value, r.value);
    return head + `${hi} ${w[1]} dari ${lo}.`;
  }
  if (l.value === r.value) return `Sama ${w[0]}, keduanya ${l.value}.`;
  const hi = Math.max(l.value, r.value);
  const lo = Math.min(l.value, r.value);
  return `${hi} ${w[1]} dari ${lo}.`;
}

/** Versi ucapan: semua angka diganti kata. */
function spoken(q: { mode: Mode; left: Side; right: Side }): string {
  const { left: l, right: r, mode } = q;
  const w = mode === "items" ? ["banyak", "lebih banyak"] : ["besar", "lebih besar"];
  const head = mode === "calc" ? `${l.exprSay} sama dengan ${numberWord(l.value)}. ${r.exprSay} sama dengan ${numberWord(r.value)}. ` : "";
  if (l.value === r.value) return head + (mode === "calc" ? `Sama ${w[0]}.` : `Sama ${w[0]}, keduanya ${numberWord(l.value)}.`);
  const hi = Math.max(l.value, r.value);
  const lo = Math.min(l.value, r.value);
  return head + `${numberWord(hi)} ${w[1]} dari ${numberWord(lo)}.`;
}

export function makeQuestion(cfg: LevelConfig, same: boolean, rng: Rng = defaultRng): Question {
  const ask = pick(cfg.asks, rng);
  const [a, b] = pickPair(cfg, same, rng);
  const swap = rng() < 0.5;
  const [lv, rv] = swap ? [b, a] : [a, b];

  let left: Side;
  let right: Side;
  if (cfg.mode === "items") {
    const sameKind = rng() < 0.5;
    const [i1, i2] = sameKind ? (() => { const i = pick(ITEMS, rng); return [i, i]; })() : sample(ITEMS, 2, rng);
    left = { value: lv, item: i1 };
    right = { value: rv, item: i2 };
  } else if (cfg.mode === "numbers") {
    left = { value: lv, expr: String(lv), exprSay: numberWord(lv) };
    right = { value: rv, expr: String(rv), exprSay: numberWord(rv) };
  } else {
    // minimal satu sisi berupa operasi; sisi lain boleh angka biasa
    const plainLeft = rng() < 0.3;
    const plainRight = !plainLeft && rng() < 0.3;
    left = makeSide(lv, plainLeft, rng);
    right = makeSide(rv, plainRight, rng);
    for (let t = 0; t < 20 && left.expr === right.expr; t++) right = makeSide(rv, plainRight, rng);
  }

  const word = WORDS[cfg.mode][ask];
  const sameLabel = cfg.mode === "items" ? "Sama banyak" : "Sama besar";
  const hasSame = cfg.sameCount > 0;
  const hint = hasSame ? ` Kalau sama, ketuk "${sameLabel}".` : "";
  const which = cfg.mode === "calc" ? `Mana yang hasilnya ${word}?` : `Mana yang ${word}?`;
  const base = { mode: cfg.mode, left, right };
  return {
    ...base,
    ask,
    answer: compareValues(lv, rv, ask),
    hasSame,
    say: which + hint,
    text: which + hint,
    sameLabel,
    reveal: describe(base),
  };
}

/** Teks ucapan untuk jawaban (angka sebagai kata). */
export const revealSpeech = (q: Question) => spoken(q);

/** Satu putaran: 10 soal, tepat cfg.sameCount di antaranya bertipe "sama" (posisinya acak). */
export function buildQuestions(cfg: LevelConfig, rng: Rng = defaultRng): Question[] {
  const sameIdx = new Set(sample(Array.from({ length: ROUNDS }, (_, i) => i), cfg.sameCount, rng));
  const out: Question[] = [];
  const seen = new Set<string>();
  const key = (q: Question) => `${q.left.expr ?? q.left.item?.id}${q.left.value}|${q.right.expr ?? q.right.item?.id}${q.right.value}|${q.ask}`;
  for (let i = 0; i < ROUNDS; i++) {
    let q = makeQuestion(cfg, sameIdx.has(i), rng);
    for (let t = 0; t < 20 && seen.has(key(q)); t++) q = makeQuestion(cfg, sameIdx.has(i), rng);
    seen.add(key(q));
    out.push(q);
  }
  return shuffle(out, rng);
}
