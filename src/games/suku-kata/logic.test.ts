import { describe, expect, it } from "vitest";
import { ALL_SYLLABLES } from "@/content/suku-kata";
import { seeded } from "@/lib/random";
import {
  buildQuestions,
  buildTiles,
  LEVEL_CONFIG,
  OPTIONS,
  ROUNDS,
  spokenWord,
  syllableOptions,
  type BuildQuestion,
  type HearQuestion,
} from "./logic";
import { SUKU_WORDS } from "@/content/suku-kata";

describe("suku kata", () => {
  it("empat tingkat dengan 10 soal valid di tiap tingkat", () => {
    expect(Object.keys(LEVEL_CONFIG)).toEqual(["mudah", "sedang", "sulit", "ahli"]);
    for (const lvl of Object.keys(LEVEL_CONFIG)) {
      for (let seed = 1; seed <= 30; seed++) {
        expect(buildQuestions(lvl, ROUNDS, seeded(seed)), `${lvl}/${seed}`).toHaveLength(ROUNDS);
      }
    }
  });

  it("mudah: jawaban ada di pilihan, pilihan unik, pengecoh beda konsonan atau vokal", () => {
    for (let seed = 1; seed <= 40; seed++) {
      const qs = buildQuestions("mudah", ROUNDS, seeded(seed)) as HearQuestion[];
      expect(new Set(qs.map((q) => q.answer)).size).toBe(ROUNDS);
      for (const q of qs) {
        expect(q.kind).toBe("hear");
        expect(q.options).toHaveLength(OPTIONS);
        expect(new Set(q.options).size).toBe(OPTIONS);
        expect(q.options.filter((o) => o === q.answer)).toHaveLength(1);
        for (const o of q.options.filter((x) => x !== q.answer)) {
          expect(ALL_SYLLABLES).toContain(o);
          const sameC = o[0] === q.answer[0];
          const sameV = o[1] === q.answer[1];
          expect(sameC || sameV, `${q.answer} vs ${o}`).toBe(true);
        }
        // minimal satu pengecoh dengan konsonan sama dan satu dengan vokal sama
        const others = q.options.filter((x) => x !== q.answer);
        expect(others.some((o) => o[0] === q.answer[0])).toBe(true);
        expect(others.some((o) => o[1] === q.answer[1])).toBe(true);
      }
    }
  });

  it("syllableOptions berlaku untuk setiap suku kata", () => {
    for (const s of ALL_SYLLABLES) {
      const o = syllableOptions(s, seeded(7));
      expect(o).toHaveLength(OPTIONS);
      expect(new Set(o).size).toBe(OPTIONS);
      expect(o).toContain(s);
    }
  });

  it("sedang: 2 suku kata terbuka, tanpa pengecoh", () => {
    for (let seed = 1; seed <= 30; seed++) {
      for (const q of buildQuestions("sedang", ROUNDS, seeded(seed)) as BuildQuestion[]) {
        expect(q.word.syllables).toHaveLength(2);
        expect(q.word.group).toBe("terbuka");
        expect(q.tiles).toHaveLength(2);
        expect(q.tiles.map((t) => t.text).sort()).toEqual([...q.word.syllables].sort());
      }
    }
  });

  it("sulit: 3 suku kata + 1-2 pengecoh yang bukan suku kata kata itu", () => {
    for (let seed = 1; seed <= 30; seed++) {
      for (const q of buildQuestions("sulit", ROUNDS, seeded(seed)) as BuildQuestion[]) {
        expect(q.word.syllables).toHaveLength(3);
        const decoys = q.tiles.filter((t) => !q.word.syllables.includes(t.text));
        expect(decoys.length).toBeGreaterThanOrEqual(1);
        expect(decoys.length).toBeLessThanOrEqual(2);
        expect(q.tiles).toHaveLength(3 + decoys.length);
      }
    }
  });

  it("ahli: kata dengan suku kata tertutup + pengecoh", () => {
    for (let seed = 1; seed <= 30; seed++) {
      for (const q of buildQuestions("ahli", ROUNDS, seeded(seed)) as BuildQuestion[]) {
        expect(q.word.group).toBe("tertutup");
        expect(q.word.syllables.some((s) => /[^aiueo]$/.test(s))).toBe(true);
        const decoys = q.tiles.filter((t) => !q.word.syllables.includes(t.text));
        expect(decoys.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("kata dalam satu putaran unik dan semua suku kata benar ada di nampan", () => {
    for (const lvl of ["sedang", "sulit", "ahli"]) {
      const qs = buildQuestions(lvl, ROUNDS, seeded(3)) as BuildQuestion[];
      expect(new Set(qs.map((q) => q.word.id)).size).toBe(ROUNDS);
      for (const q of qs) {
        expect(new Set(q.tiles.map((t) => t.id)).size).toBe(q.tiles.length);
        const counts = new Map<string, number>();
        q.tiles.forEach((t) => counts.set(t.text, (counts.get(t.text) ?? 0) + 1));
        for (const s of q.word.syllables) {
          const need = q.word.syllables.filter((x) => x === s).length;
          expect(counts.get(s) ?? 0).toBeGreaterThanOrEqual(need);
        }
      }
    }
  });

  it("nampan tanpa pengecoh tidak langsung berurutan benar", () => {
    const w = SUKU_WORDS.find((x) => x.word === "baju")!;
    for (let seed = 1; seed <= 30; seed++) {
      expect(buildTiles(w, 0, seeded(seed)).map((t) => t.text).join("")).not.toBe("baju");
    }
  });

  it("deterministik dengan RNG yang sama", () => {
    for (const lvl of Object.keys(LEVEL_CONFIG)) {
      expect(buildQuestions(lvl, ROUNDS, seeded(11))).toEqual(buildQuestions(lvl, ROUNDS, seeded(11)));
    }
  });

  it("kalimat ucapan kata", () => {
    const w = SUKU_WORDS.find((x) => x.word === "baju")!;
    expect(spokenWord(w)).toBe("ba, ju. baju");
  });
});
