import { itemsFor, type ContentItem } from "@/content/items";
import { defaultRng, sample, shuffle, type Rng } from "@/lib/random";

export const ROUNDS = 10;

export interface LevelConfig {
  /** detik waktu menghafal */
  memo: number;
  /** jumlah pilihan jawaban */
  opts: number;
  /** 0..1: porsi pengecoh yang diambil dari kartu lain di deck (membingungkan) */
  mix: number;
  /** detik batas waktu per tebakan; 0 = tanpa batas */
  qTime: number;
  /** urutan kartu yang ditanyakan diacak */
  shuffled: boolean;
}

export const LEVEL_CONFIG: Record<string, LevelConfig> = {
  mudah: { memo: 60, opts: 4, mix: 0, qTime: 0, shuffled: false },
  sedang: { memo: 45, opts: 6, mix: 0.4, qTime: 0, shuffled: false },
  sulit: { memo: 30, opts: 8, mix: 0.6, qTime: 12, shuffled: false },
  ahli: { memo: 20, opts: 8, mix: 0.8, qTime: 8, shuffled: true },
};

/** Pilih n kartu unik dari tema. */
export function pickDeck(category: string, n = ROUNDS, rng: Rng = defaultRng): ContentItem[] {
  return sample(itemsFor(category), n, rng);
}

/** Urutan kartu yang ditanyakan. */
export function questionOrder(n: number, shuffled: boolean, rng: Rng = defaultRng): number[] {
  const base = Array.from({ length: n }, (_, i) => i);
  return shuffled ? shuffle(base, rng) : base;
}

/**
 * Pilihan jawaban: kartu yang benar + pengecoh.
 * Sebagian pengecoh dari kartu lain di deck (mix), sisanya dari luar deck.
 */
export function buildOptions(
  correct: ContentItem,
  deck: readonly ContentItem[],
  pool: readonly ContentItem[],
  cfg: Pick<LevelConfig, "opts" | "mix">,
  rng: Rng = defaultRng,
): ContentItem[] {
  const others = deck.filter((c) => c.id !== correct.id);
  const outside = pool.filter((c) => !deck.some((d) => d.id === c.id));
  const need = cfg.opts - 1;
  const fromDeck = Math.min(others.length, Math.round(need * cfg.mix));
  let dis = shuffle(others, rng).slice(0, fromDeck);
  dis = dis.concat(shuffle(outside, rng).slice(0, need - dis.length));
  if (dis.length < need) {
    const rest = others.filter((c) => !dis.some((d) => d.id === c.id));
    dis = dis.concat(shuffle(rest, rng).slice(0, need - dis.length));
  }
  return shuffle([correct, ...dis], rng);
}

/** Jumlah kolom pilihan agar rapi (4 -> 4, 6 -> 3x2, 8 -> 4x2). */
export const choiceCols = (opts: number) => (opts === 6 ? 3 : Math.min(opts, 4));
