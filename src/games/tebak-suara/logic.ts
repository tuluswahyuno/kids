import { ANIMALS, type ContentItem } from "@/content/items";
import { defaultRng, shuffle, type Rng } from "@/lib/random";

export const ROUNDS = 10;

export type QuestionMode = "sound" | "clue";

export interface LevelConfig {
  mode: QuestionMode;
  /** jumlah pilihan jawaban */
  options: number;
  /** tampilkan tulisan bunyi (mis. "MEONG MEONG") */
  showSoundText: boolean;
  /** tampilkan nama di bawah gambar pilihan */
  showNames: boolean;
}

export const LEVEL_CONFIG: Record<string, LevelConfig> = {
  mudah: { mode: "sound", options: 3, showSoundText: true, showNames: true },
  sedang: { mode: "sound", options: 4, showSoundText: false, showNames: true },
  sulit: { mode: "clue", options: 4, showSoundText: false, showNames: true },
  ahli: { mode: "sound", options: 6, showSoundText: false, showNames: false },
};

export interface Question {
  answer: ContentItem;
  /** pilihan sudah diacak; selalu memuat answer, tanpa duplikat */
  options: ContentItem[];
}

/** Bangun n soal unik dari daftar hewan bersuara. Fungsi murni (RNG disuntik). */
export function buildQuestions(
  cfg: LevelConfig,
  n = ROUNDS,
  rng: Rng = defaultRng,
  pool: readonly ContentItem[] = ANIMALS,
): Question[] {
  const answers = shuffle(pool, rng).slice(0, n);
  return answers.map((answer) => {
    const decoys = shuffle(
      pool.filter((a) => a.id !== answer.id),
      rng,
    ).slice(0, cfg.options - 1);
    return { answer, options: shuffle([answer, ...decoys], rng) };
  });
}
