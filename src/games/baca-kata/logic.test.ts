import { describe, expect, it } from "vitest";
import { seeded } from "@/lib/random";
import { buildOptions, buildQuestions, letterCount, LEVEL_CONFIG, pickAnswers, ROUNDS } from "./logic";

const CATS = ["hewan", "lokal", "buah", "kendaraan", "benda", "semua"];

describe("baca kata", () => {
  it("setiap tema dan tingkat menghasilkan 10 soal valid", () => {
    for (const cat of CATS) {
      for (const [lvl, cfg] of Object.entries(LEVEL_CONFIG)) {
        const qs = buildQuestions(cat, cfg, seeded(7));
        const tag = `${cat}/${lvl}`;
        expect(qs, tag).toHaveLength(ROUNDS);
        expect(new Set(qs.map((q) => q.answer.id)).size, tag).toBe(ROUNDS);
        for (const q of qs) {
          expect(q.options, tag).toHaveLength(cfg.options);
          expect(q.options.map((o) => o.id), tag).toContain(q.answer.id);
          expect(new Set(q.options.map((o) => o.id)).size, tag).toBe(cfg.options);
          expect(new Set(q.options.map((o) => o.emoji)).size, tag).toBe(cfg.options);
          expect(new Set(q.options.map((o) => o.name)).size, tag).toBe(cfg.options);
        }
      }
    }
  });

  it("tingkat mudah memakai kata pendek bila tersedia, sedang maksimum 7 huruf", () => {
    for (const cat of ["hewan", "benda", "lokal"]) {
      pickAnswers(cat, LEVEL_CONFIG.mudah, ROUNDS, seeded(3)).forEach((it) => expect(letterCount(it.name)).toBeLessThanOrEqual(5));
    }
    for (const cat of CATS) {
      pickAnswers(cat, LEVEL_CONFIG.sedang, ROUNDS, seeded(4)).forEach((it) => expect(letterCount(it.name), cat).toBeLessThanOrEqual(7));
    }
  });

  it("pengecoh diutamakan dari kategori yang sama", () => {
    const [a] = pickAnswers("buah", LEVEL_CONFIG.mudah, 1, seeded(5));
    const opts = buildOptions(a, "semua", 3, seeded(5));
    opts.forEach((o) => expect(o.categories.some((c) => a.categories.includes(c))).toBe(true));
  });

  it("deterministik dengan seeded()", () => {
    const f = () => buildQuestions("semua", LEVEL_CONFIG.sulit, seeded(42)).map((q) => [q.answer.id, ...q.options.map((o) => o.id)]);
    expect(f()).toEqual(f());
  });

  it("tingkat ahli punya batas waktu 10 detik", () => {
    expect(LEVEL_CONFIG.ahli.time).toBe(10);
    expect(LEVEL_CONFIG.sulit.time).toBe(0);
  });
});
