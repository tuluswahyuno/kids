import { describe, expect, it } from "vitest";
import { ALL_SYLLABLES, CONSONANTS, SUKU_WORDS, SYLLABLE_ROWS, VOWELS } from "./suku-kata";

describe("konten suku kata", () => {
  it("tabel suku kata lengkap: tiap konsonan x lima vokal, unik", () => {
    expect(SYLLABLE_ROWS).toHaveLength(CONSONANTS.length);
    for (const r of SYLLABLE_ROWS) {
      expect(r.syllables).toEqual(VOWELS.map((v) => r.consonant + v));
    }
    expect(SYLLABLE_ROWS[0].syllables.join(" ")).toBe("ba bi bu be bo");
    expect(new Set(ALL_SYLLABLES).size).toBe(ALL_SYLLABLES.length);
    expect(ALL_SYLLABLES.length).toBe(CONSONANTS.length * 5);
  });

  it("minimal 45 kata, id dan emoji unik", () => {
    expect(SUKU_WORDS.length).toBeGreaterThanOrEqual(45);
    expect(new Set(SUKU_WORDS.map((x) => x.id)).size).toBe(SUKU_WORDS.length);
    expect(new Set(SUKU_WORDS.map((x) => x.word)).size).toBe(SUKU_WORDS.length);
    expect(new Set(SUKU_WORDS.map((x) => x.emoji)).size).toBe(SUKU_WORDS.length);
  });

  it("suku kata bila digabung sama dengan kata (huruf kecil), data lengkap", () => {
    for (const x of SUKU_WORDS) {
      expect(x.emoji.length, x.id).toBeGreaterThan(0);
      expect(x.word, x.id).toMatch(/^[a-z]+$/);
      expect(x.syllables.join(""), x.id).toBe(x.word);
      expect(x.syllables.length, x.id).toBeGreaterThanOrEqual(2);
      expect(x.syllables.length, x.id).toBeLessThanOrEqual(3);
    }
  });

  it("tiap suku kata punya tepat satu vokal (tidak ada diftong/gugus rumit)", () => {
    for (const x of SUKU_WORDS) {
      for (const s of x.syllables) expect(s.match(/[aiueo]/g)?.length, `${x.id}:${s}`).toBe(1);
    }
  });

  it("kelompok terbuka/tertutup sesuai bentuk suku kata", () => {
    for (const x of SUKU_WORDS) {
      const open = x.syllables.every((s) => /[aiueo]$/.test(s));
      expect(x.group, x.id).toBe(open ? "terbuka" : "tertutup");
    }
  });

  it("cukup kata untuk 10 soal di tiap tingkat", () => {
    const open2 = SUKU_WORDS.filter((x) => x.group === "terbuka" && x.syllables.length === 2);
    const three = SUKU_WORDS.filter((x) => x.syllables.length === 3);
    const closed = SUKU_WORDS.filter((x) => x.group === "tertutup");
    expect(open2.length).toBeGreaterThanOrEqual(12);
    expect(three.length).toBeGreaterThanOrEqual(12);
    expect(closed.length).toBeGreaterThanOrEqual(12);
  });

  it("tidak mengandung kata tak pantas untuk anak", () => {
    const banned = ["bunuh", "darah", "bodoh", "setan", "mati", "perang"];
    for (const x of SUKU_WORDS) banned.forEach((b) => expect(x.word).not.toContain(b));
  });
});
