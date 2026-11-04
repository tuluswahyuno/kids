import { describe, expect, it } from "vitest";
import { seeded } from "@/lib/random";
import { buildQuestions, LEVEL_CONFIG, ROUNDS } from "./logic";

describe("tebak suara", () => {
  for (const [lvl, cfg] of Object.entries(LEVEL_CONFIG)) {
    it(`tingkat ${lvl}: 10 soal unik, jawaban ada di pilihan, pilihan unik, jumlah sesuai`, () => {
      for (let seed = 1; seed <= 20; seed++) {
        const qs = buildQuestions(cfg, ROUNDS, seeded(seed));
        expect(qs).toHaveLength(ROUNDS);
        expect(new Set(qs.map((q) => q.answer.id)).size).toBe(ROUNDS);
        for (const q of qs) {
          expect(q.options).toHaveLength(cfg.options);
          expect(new Set(q.options.map((o) => o.id)).size).toBe(cfg.options);
          expect(q.options.some((o) => o.id === q.answer.id)).toBe(true);
          expect(q.answer.animal).toBeDefined();
        }
      }
    });
  }

  it("tingkat sulit memakai teka-teki, lainnya memakai suara", () => {
    expect(LEVEL_CONFIG.sulit.mode).toBe("clue");
    expect(LEVEL_CONFIG.mudah.mode).toBe("sound");
    expect(LEVEL_CONFIG.ahli.showNames).toBe(false);
    expect(LEVEL_CONFIG.mudah.showSoundText).toBe(true);
  });

  it("deterministik untuk seed sama", () => {
    const a = buildQuestions(LEVEL_CONFIG.sedang, ROUNDS, seeded(7)).map((q) => q.answer.id);
    const b = buildQuestions(LEVEL_CONFIG.sedang, ROUNDS, seeded(7)).map((q) => q.answer.id);
    expect(a).toEqual(b);
  });
});
