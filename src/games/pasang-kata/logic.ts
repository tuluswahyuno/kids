import { itemsFor, type ContentItem } from "@/content/items";
import { defaultRng, shuffle, type Rng } from "@/lib/random";

export interface LevelConfig {
  /** jumlah pasangan per papan */
  per: number;
  boards: number;
}

export const LEVEL_CONFIG: Record<string, LevelConfig> = {
  mudah: { per: 3, boards: 3 },
  sedang: { per: 4, boards: 3 },
  sulit: { per: 5, boards: 2 },
};

export const totalPairs = (cfg: LevelConfig) => cfg.per * cfg.boards;

/** Bagi item acak (unik) menjadi `boards` papan berisi `per` pasangan. */
export function pickBoards(category: string, cfg: LevelConfig, rng: Rng = defaultRng): ContentItem[][] {
  const need = totalPairs(cfg);
  let items = shuffle(itemsFor(category), rng);
  if (items.length < need) {
    const extra = shuffle(itemsFor("semua"), rng).filter((x) => !items.some((i) => i.id === x.id));
    items = items.concat(extra);
  }
  items = items.slice(0, need);
  return Array.from({ length: cfg.boards }, (_, b) => items.slice(b * cfg.per, (b + 1) * cfg.per));
}

/** Acak urutan kata; usahakan berbeda dari urutan gambar agar tidak langsung sejajar. */
export function shuffleDifferent(board: readonly ContentItem[], rng: Rng = defaultRng): ContentItem[] {
  let out = shuffle(board, rng);
  for (let i = 0; i < 5 && board.length > 1 && out.every((x, k) => x.id === board[k].id); i++) {
    out = shuffle(board, rng);
  }
  return out;
}
