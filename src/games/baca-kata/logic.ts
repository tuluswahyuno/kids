import { itemsFor, type ContentItem } from "@/content/items";
import { defaultRng, shuffle, type Rng } from "@/lib/random";

export const ROUNDS = 10;

export interface LevelConfig {
  /** panjang kata maksimum (jumlah huruf) */
  maxLen: number;
  options: number;
  /** tampilkan kata dengan garis suku kata */
  syllables: boolean;
  /** batas waktu per soal (detik); 0 = tanpa batas */
  time: number;
}

export const LEVEL_CONFIG: Record<string, LevelConfig> = {
  mudah: { maxLen: 5, options: 3, syllables: true, time: 0 },
  sedang: { maxLen: 7, options: 4, syllables: false, time: 0 },
  sulit: { maxLen: 99, options: 6, syllables: false, time: 0 },
  ahli: { maxLen: 99, options: 6, syllables: false, time: 10 },
};

export interface Question {
  answer: ContentItem;
  /** sudah diacak, memuat jawaban; emoji unik */
  options: ContentItem[];
}

export const letterCount = (name: string) => name.replace(/[^A-Za-z]/g, "").length;

/** Buang item dengan emoji kembar supaya pilihan gambar tidak ambigu. */
function uniqueByEmoji(items: ContentItem[]): ContentItem[] {
  const seen = new Set<string>();
  return items.filter((it) => {
    if (seen.has(it.emoji)) return false;
    seen.add(it.emoji);
    return true;
  });
}

/** Pilih n kata; bila kata yang cukup pendek kurang, ambil yang terdekat panjangnya. */
export function pickAnswers(category: string, cfg: LevelConfig, n = ROUNDS, rng: Rng = defaultRng): ContentItem[] {
  const pool = uniqueByEmoji(itemsFor(category));
  const over = (it: ContentItem) => Math.max(0, letterCount(it.name) - cfg.maxLen);
  const chosen = shuffle(pool, rng)
    .sort((a, b) => over(a) - over(b))
    .slice(0, n);
  return shuffle(chosen, rng);
}

/** Pengecoh diutamakan dari kategori yang sama dengan jawaban. */
export function buildOptions(answer: ContentItem, category: string, count: number, rng: Rng = defaultRng): ContentItem[] {
  const ok = (it: ContentItem) => it.id !== answer.id && it.emoji !== answer.emoji && it.name !== answer.name;
  const pool = uniqueByEmoji(itemsFor(category)).filter(ok);
  const same = pool.filter((it) => it.categories.some((c) => answer.categories.includes(c)));
  const rest = pool.filter((it) => !same.includes(it));
  const decoys = [...shuffle(same, rng), ...shuffle(rest, rng)];
  const chosen: ContentItem[] = [];
  const emojis = new Set([answer.emoji]);
  for (const d of decoys) {
    if (chosen.length >= count - 1) break;
    if (emojis.has(d.emoji)) continue;
    emojis.add(d.emoji);
    chosen.push(d);
  }
  return shuffle([answer, ...chosen], rng);
}

export function buildQuestions(category: string, cfg: LevelConfig, rng: Rng = defaultRng, n = ROUNDS): Question[] {
  return pickAnswers(category, cfg, n, rng).map((answer) => ({ answer, options: buildOptions(answer, category, cfg.options, rng) }));
}
