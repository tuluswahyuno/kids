import { describe, expect, it } from "vitest";
import { seeded } from "@/lib/random";
import { buildQuestions, LEVEL_CONFIG, makeOptions, ROUNDS, type ChoiceQuestion, type OrderQuestion } from "./logic";

const SEEDS = Array.from({ length: 200 }, (_, i) => i + 1);
const LEVELS = Object.entries(LEVEL_CONFIG);

describe("kenali-angka: pilihan", () => {
  it("memuat jawaban, unik, dalam rentang, jumlah tepat", () => {
    for (const [min, max, count] of [[1, 5, 3], [1, 10, 3], [11, 20, 4]] as const) {
      for (let a = min; a <= max; a++) {
        for (const s of [1, 2, 3]) {
          const o = makeOptions(a, min, max, count, seeded(s * 50 + a));
          expect(o).toHaveLength(count);
          expect(new Set(o).size).toBe(count);
          expect(o).toContain(a);
          o.forEach((v) => {
            expect(v).toBeGreaterThanOrEqual(min);
            expect(v).toBeLessThanOrEqual(max);
          });
        }
      }
    }
  });
});

describe("kenali-angka: satu putaran", () => {
  it("total 10 soal untuk setiap tingkat", () => {
    for (const [, cfg] of LEVELS) for (const s of SEEDS) expect(buildQuestions(cfg, seeded(s))).toHaveLength(ROUNDS);
  });

  it("deterministik dengan seeded()", () => {
    for (const [, cfg] of LEVELS) expect(buildQuestions(cfg, seeded(7))).toEqual(buildQuestions(cfg, seeded(7)));
  });

  it("soal pilihan: jawaban ada di pilihan, unik, di rentang tingkat, benar secara matematis", () => {
    for (const [, cfg] of LEVELS.filter(([, c]) => !c.order)) {
      for (const s of SEEDS) {
        for (const q of buildQuestions(cfg, seeded(s)) as ChoiceQuestion[]) {
          expect(q.options).toHaveLength(cfg.options);
          expect(new Set(q.options).size).toBe(cfg.options);
          expect(q.options).toContain(q.answer);
          for (const v of q.options) {
            expect(v).toBeGreaterThanOrEqual(cfg.min);
            expect(v).toBeLessThanOrEqual(cfg.max);
          }
          expect(cfg.kinds).toContain(q.kind);
          if (q.kind === "next") expect(q.answer).toBe(q.ref! + 1);
          if (q.kind === "prev") expect(q.answer).toBe(q.ref! - 1);
          if (q.kind === "missing") {
            const seq = q.seq!;
            expect(seq).toHaveLength(4);
            expect(seq.filter((v) => v === null)).toHaveLength(1);
            const i = seq.indexOf(null);
            const start = q.answer - i;
            seq.forEach((v, j) => {
              if (v !== null) expect(v).toBe(start + j);
            });
            expect(start).toBeGreaterThanOrEqual(cfg.min);
            expect(start + 3).toBeLessThanOrEqual(cfg.max);
          }
        }
      }
    }
  });

  it("tingkat sulit memakai kata angka belasan", () => {
    const qs = buildQuestions(LEVEL_CONFIG.sulit, seeded(3)) as ChoiceQuestion[];
    expect(qs.some((q) => /sebelas|belas|puluh/.test(q.say + q.reveal))).toBe(true);
  });

  it("urutan: 4–5 angka unik di 1–20, separuh naik separuh turun, hasil terurut benar", () => {
    const cfg = LEVEL_CONFIG.ahli;
    for (const s of SEEDS) {
      const qs = buildQuestions(cfg, seeded(s)) as OrderQuestion[];
      expect(qs.filter((q) => q.dir === "asc")).toHaveLength(5);
      for (const q of qs) {
        expect(q.type).toBe("order");
        expect([4, 5]).toContain(q.numbers.length);
        expect(new Set(q.numbers).size).toBe(q.numbers.length);
        q.numbers.forEach((v) => {
          expect(v).toBeGreaterThanOrEqual(1);
          expect(v).toBeLessThanOrEqual(20);
        });
        expect([...q.sorted].sort((a, b) => (q.dir === "asc" ? a - b : b - a))).toEqual(q.sorted);
        expect([...q.sorted].sort((a, b) => a - b)).toEqual([...q.numbers].sort((a, b) => a - b));
        expect(q.text).toContain(q.dir === "asc" ? "terkecil" : "terbesar");
      }
    }
  });
});
