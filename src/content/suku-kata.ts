/**
 * KONTEN SUKU KATA: tabel suku kata terbuka (konsonan + vokal) dan kata benda
 * bergambar dengan pemenggalan menurut PUEBI.
 */

export const VOWELS = ["a", "i", "u", "e", "o"] as const;
export const CONSONANTS = ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "r", "s", "t", "w", "y"] as const;

export interface SyllableRow {
  consonant: string;
  syllables: string[];
}

/** Satu baris per konsonan: ba bi bu be bo, ca ci cu ce co, dst. */
export const SYLLABLE_ROWS: SyllableRow[] = CONSONANTS.map((c) => ({
  consonant: c,
  syllables: VOWELS.map((v) => c + v),
}));

export const ALL_SYLLABLES: string[] = SYLLABLE_ROWS.flatMap((r) => r.syllables);

export type WordGroup = "terbuka" | "tertutup";

export interface SukuWord {
  id: string;
  emoji: string;
  word: string;
  syllables: string[];
  /** terbuka: semua suku kata berakhir vokal; tertutup: ada suku kata berakhir konsonan */
  group: WordGroup;
}

const w = (emoji: string, hyphenated: string): SukuWord => {
  const syllables = hyphenated.split("-");
  const word = syllables.join("");
  const open = syllables.every((s) => /[aiueo]$/.test(s));
  return { id: word, emoji, word, syllables, group: open ? "terbuka" : "tertutup" };
};

export const SUKU_WORDS: SukuWord[] = [
  // ---- 2 suku kata, semua terbuka ----
  w("👕", "ba-ju"), w("📖", "bu-ku"), w("👁️", "ma-ta"), w("🦶", "ka-ki"), w("🐴", "ku-da"),
  w("🐄", "sa-pi"), w("🛋️", "so-fa"), w("⚽", "bo-la"), w("🥛", "su-su"), w("🍚", "na-si"),
  w("🧀", "ke-ju"), w("🗺️", "pe-ta"), w("❤️", "ha-ti"), w("☕", "ko-pi"), w("🍒", "ce-ri"),
  w("🎁", "ka-do"), w("🐷", "ba-bi"), w("🥝", "ki-wi"), w("🧢", "to-pi"), w("🍞", "ro-ti"),
  // ---- 3 suku kata, semua terbuka ----
  w("👟", "se-pa-tu"), w("🥥", "ke-la-pa"), w("🚲", "se-pe-da"), w("📷", "ka-me-ra"),
  w("🚂", "ke-re-ta"), w("☄️", "ko-me-ta"), w("🥋", "ka-ra-te"),
  // ---- 3 suku kata, ada suku kata tertutup ----
  w("🐰", "ke-lin-ci"), w("✈️", "pe-sa-wat"), w("📞", "te-le-pon"), w("🍱", "ma-ka-nan"),
  w("🥤", "mi-nu-man"), w("🪂", "pa-ra-sut"),
  // ---- 2 suku kata, suku kata tertutup ----
  w("🌙", "bu-lan"), w("🍽️", "ma-kan"), w("🐟", "i-kan"), w("🏠", "ru-mah"), w("🐓", "a-yam"),
  w("🐍", "u-lar"), w("🚢", "ka-pal"), w("🎈", "ba-lon"), w("🚗", "mo-bil"), w("🏍️", "mo-tor"),
  w("🍎", "a-pel"), w("🍅", "to-mat"), w("🥕", "wor-tel"), w("✏️", "pen-sil"), w("🥬", "sa-yur"),
  w("🏞️", "ta-man"), w("📰", "ko-ran"), w("🧼", "sa-bun"), w("🤖", "ro-bot"), w("🥚", "te-lur"),
  w("🐘", "ga-jah"), w("🛏️", "ka-sur"), w("🧥", "ja-ket"), w("🥄", "sen-dok"), w("🐭", "ti-kus"),
];
