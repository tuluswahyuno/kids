import { numberWord } from "@/content/items";
import { defaultRng, sample, shuffle, type Rng } from "@/lib/random";

export const ROUNDS = 10;

export type Mode = "huruf" | "angka";
export type Token = string | number;

export interface LevelConfig {
  /** jumlah balon di layar */
  balloons: number;
  /** lama (detik) balon terbang dari bawah sampai atas */
  dur: number;
  /** angka terbesar untuk mode angka */
  maxNum: number;
}

export const LEVEL_CONFIG: Record<string, LevelConfig> = {
  mudah: { balloons: 4, dur: 7, maxNum: 5 },
  sedang: { balloons: 6, dur: 5, maxNum: 10 },
  sulit: { balloons: 8, dur: 3.8, maxNum: 20 },
  ahli: { balloons: 9, dur: 2.8, maxNum: 20 },
};

export const BALLOON_COLORS = ["#e64980", "#4c6ef5", "#f08c00", "#2f9e44", "#ae3ec9", "#15aabf", "#e8590c"];

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const parseMode = (category: string): Mode => (category === "angka" ? "angka" : "huruf");

/** Semua nilai yang mungkin muncul di balon untuk mode & tingkat ini. */
export function poolFor(mode: Mode, cfg: LevelConfig): Token[] {
  return mode === "huruf" ? LETTERS : Array.from({ length: cfg.maxNum }, (_, i) => i + 1);
}

/** n target: tidak berulang selama kolam cukup besar; jika tidak, diulang bergiliran. */
export function pickTargets(mode: Mode, cfg: LevelConfig, n = ROUNDS, rng: Rng = defaultRng): Token[] {
  const pool = poolFor(mode, cfg);
  const out: Token[] = [];
  while (out.length < n) out.push(...shuffle(pool, rng));
  return out.slice(0, n);
}

/** Jeda (pecahan dari lama terbang) untuk balon bernomor ganjil bila balon banyak. */
export const STAGGER = 0.18;

export interface Balloon {
  id: number;
  value: Token;
  /** posisi horizontal 0..1 (dari kiri ke kanan, sudah memperhitungkan lebar balon) */
  frac: number;
  /** detik */
  duration: number;
  /** jeda peluncuran (detik) agar balon bertetangga tidak bertumpuk */
  delay: number;
  color: number;
}

export interface Round {
  no: number;
  target: Token;
  balloons: Balloon[];
}

/** Satu putaran: tepat satu balon target + pengecoh yang berbeda-beda. */
export function buildRound(mode: Mode, cfg: LevelConfig, target: Token, no: number, rng: Rng = defaultRng): Round {
  const others = sample(
    poolFor(mode, cfg).filter((v) => v !== target),
    cfg.balloons - 1,
    rng,
  );
  const values = shuffle([target, ...others], rng);
  const n = values.length;
  const balloons = values.map<Balloon>((value, i) => ({
    id: i,
    value,
    frac: (i + rng() * 0.8) / (n - 1 + 0.8),
    // balon target sedikit lebih lambat supaya selalu sempat disentuh
    duration: cfg.dur * (0.9 + rng() * 0.3) + (value === target ? 0.4 : 0),
    delay: n >= 6 && i % 2 === 1 ? cfg.dur * STAGGER : 0,
    color: (i + no) % BALLOON_COLORS.length,
  }));
  return { no, target, balloons };
}

/** Batas waktu putaran: lama terbang + sedikit kelonggaran. */
export const roundTimeoutMs = (cfg: LevelConfig) =>
  Math.round(cfg.dur * 1000 + 300 + (cfg.balloons >= 6 ? cfg.dur * STAGGER * 1000 : 0));

const kind = (mode: Mode) => (mode === "huruf" ? "huruf" : "angka");
const say = (mode: Mode, v: Token) => (mode === "angka" && typeof v === "number" ? numberWord(v) : String(v));

export const promptSpeech = (mode: Mode, target: Token) => `Pecahkan ${kind(mode)} ${say(mode, target)}`;
export const correctSpeech = (mode: Mode, target: Token) =>
  mode === "huruf" ? `Benar! Huruf ${target}` : `Benar! ${say(mode, target)}`;
export const missSpeech = (mode: Mode, target: Token) => `Yah, terbang. Itu ${kind(mode)} ${say(mode, target)}`;
export const wrongText = (mode: Mode, tapped: Token, target: Token) => `Itu ${kind(mode)} ${tapped}. Cari ${target}! 🔍`;
export const kindLabel = kind;
