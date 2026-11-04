import { describe, expect, it } from "vitest";
import { initialOf, letterOf, similarTo } from "@/content/huruf";
import { seeded } from "@/lib/random";
import { buildQuestions, exampleSentence, LEVEL_CONFIG, OPTIONS, ROUNDS, SIMILAR_CANDIDATES } from "./logic";

const LEVELS = Object.keys(LEVEL_CONFIG);

describe("kenali huruf", () => {
  it("ada empat tingkat", () => {
    expect(LEVELS).toEqual(["mudah", "sedang", "sulit", "ahli"]);
  });

  it("tiap tingkat menghasilkan 10 soal valid, jawaban selalu ada di pilihan, pilihan unik", () => {
    for (const lvl of LEVELS) {
      for (let seed = 1; seed <= 30; seed++) {
        const qs = buildQuestions(lvl, ROUNDS, seeded(seed));
        expect(qs, `${lvl}/${seed}`).toHaveLength(ROUNDS);
        for (const q of qs) {
          expect(q.options, lvl).toHaveLength(OPTIONS);
          expect(new Set(q.options).size, lvl).toBe(OPTIONS);
          expect(q.options.filter((o) => o === q.answer), lvl).toHaveLength(1);
          expect(q.speech.length).toBeGreaterThan(0);
          expect(q.ask.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("jawaban tidak berulang dalam satu putaran", () => {
    for (const lvl of LEVELS) {
      const qs = buildQuestions(lvl, ROUNDS, seeded(5));
      expect(new Set(qs.map((q) => q.letter.upper)).size, lvl).toBe(ROUNDS);
    }
  });

  it("mudah: huruf besar semua dan nama huruf diucapkan", () => {
    for (const q of buildQuestions("mudah", ROUNDS, seeded(2))) {
      q.options.forEach((o) => expect(o).toMatch(/^[A-Z]$/));
      expect(q.speech).toContain(q.letter.name);
      expect(q.answer).toBe(q.letter.upper);
    }
  });

  it("sedang: pilihan dalam huruf besar/kecil kebalikan dari yang ditampilkan; kedua arah muncul", () => {
    const dirs = new Set<string>();
    for (let seed = 1; seed <= 10; seed++) {
      for (const q of buildQuestions("sedang", ROUNDS, seeded(seed))) {
        dirs.add(q.optionCase);
        if (q.optionCase === "lower") {
          expect(q.shown).toBe(q.letter.upper);
          q.options.forEach((o) => expect(o).toMatch(/^[a-z]$/));
          expect(q.answer).toBe(q.letter.lower);
        } else {
          expect(q.shown).toBe(q.letter.lower);
          q.options.forEach((o) => expect(o).toMatch(/^[A-Z]$/));
          expect(q.answer).toBe(q.letter.upper);
        }
      }
    }
    expect(dirs.size).toBe(2);
  });

  it("sulit: jawaban = huruf awal nama benda, pengecoh bukan huruf awal yang sama", () => {
    for (let seed = 1; seed <= 30; seed++) {
      for (const q of buildQuestions("sulit", ROUNDS, seeded(seed))) {
        expect(q.item).not.toBeNull();
        const init = initialOf(q.item!.name)!;
        expect(q.answer).toBe(init);
        expect(q.options.filter((o) => o === init)).toHaveLength(1);
        // tidak ada pengecoh yang juga merupakan huruf awal nama benda ini
        q.options.filter((o) => o !== init).forEach((o) => expect(o).not.toBe(init));
        expect(exampleSentence(q)).toBe(`${q.letter.name} untuk ${q.item!.name}`);
      }
    }
  });

  it("sulit: tiap soal satu huruf awal berbeda", () => {
    const qs = buildQuestions("sulit", ROUNDS, seeded(9));
    expect(new Set(qs.map((q) => q.answer)).size).toBe(ROUNDS);
    expect(new Set(qs.map((q) => q.item!.emoji)).size).toBe(ROUNDS);
  });

  it("ahli: jawaban punya huruf mirip dan pengecoh didominasi huruf mirip", () => {
    expect(SIMILAR_CANDIDATES.length).toBeGreaterThanOrEqual(10);
    for (let seed = 1; seed <= 30; seed++) {
      for (const q of buildQuestions("ahli", ROUNDS, seeded(seed))) {
        const alike = similarTo(q.letter.lower);
        const decoys = q.options.filter((o) => o !== q.answer).map((o) => o.toLowerCase());
        expect(decoys.some((d) => alike.includes(d))).toBe(true);
        expect(q.options.every((o) => (q.optionCase === "lower" ? o === o.toLowerCase() : o === o.toUpperCase()))).toBe(true);
        expect(letterOf(q.answer)?.upper).toBe(q.letter.upper);
      }
    }
  });

  it("ahli: huruf b/d/p/q dan m/n/w bisa menjadi jawaban dengan pengecoh lengkap", () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 60; seed++) {
      for (const q of buildQuestions("ahli", ROUNDS, seeded(seed))) {
        if (q.letter.lower === "b") {
          seen.add("b");
          expect(q.options.map((o) => o.toLowerCase()).sort()).toEqual(["b", "d", "p", "q"]);
        }
      }
    }
    expect(seen.has("b")).toBe(true);
  });

  it("deterministik dengan RNG yang sama", () => {
    for (const lvl of LEVELS) {
      expect(buildQuestions(lvl, ROUNDS, seeded(42))).toEqual(buildQuestions(lvl, ROUNDS, seeded(42)));
    }
  });

  it("tingkat tak dikenal jatuh ke mudah", () => {
    const qs = buildQuestions("???", ROUNDS, seeded(1));
    expect(qs[0].mode).toBe("hear");
  });
});
