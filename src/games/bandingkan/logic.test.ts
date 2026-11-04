import { describe, expect, it } from "vitest";
import { seeded } from "@/lib/random";
import { buildQuestions, compareValues, LEVEL_CONFIG, ROUNDS, type Question } from "./logic";

const SEEDS = Array.from({ length: 200 }, (_, i) => i + 1);
const LEVELS = Object.entries(LEVEL_CONFIG);

const evalExpr = (e: string) => {
  const m = /^(\d+)(?: ([+−]) (\d+))?$/.exec(e);
  if (!m) throw new Error(`ekspresi tak dikenal: ${e}`);
  if (!m[2]) return Number(m[1]);
  return m[2] === "+" ? Number(m[1]) + Number(m[3]) : Number(m[1]) - Number(m[3]);
};

describe("bandingkan: compareValues", () => {
  it("menentukan sisi yang benar", () => {
    expect(compareValues(5, 3, "more")).toBe("left");
    expect(compareValues(5, 3, "less")).toBe("right");
    expect(compareValues(2, 7, "more")).toBe("right");
    expect(compareValues(2, 7, "less")).toBe("left");
    expect(compareValues(4, 4, "more")).toBe("same");
    expect(compareValues(4, 4, "less")).toBe("same");
  });
});

describe("bandingkan: satu putaran", () => {
  it("total 10 soal dan deterministik dengan seeded()", () => {
    for (const [, cfg] of LEVELS) {
      for (const s of SEEDS) expect(buildQuestions(cfg, seeded(s))).toHaveLength(ROUNDS);
      expect(buildQuestions(cfg, seeded(9))).toEqual(buildQuestions(cfg, seeded(9)));
    }
  });

  it("jumlah soal 'sama' sesuai tingkat; mudah tanpa 'sama'", () => {
    for (const [id, cfg] of LEVELS) {
      for (const s of SEEDS) {
        const qs = buildQuestions(cfg, seeded(s));
        expect(qs.filter((q) => q.answer === "same")).toHaveLength(cfg.sameCount);
        if (id === "mudah") expect(qs.every((q) => !q.hasSame)).toBe(true);
        else expect(qs.every((q) => q.hasSame)).toBe(true);
      }
    }
  });

  it("nilai dalam rentang, selisih memadai, jawaban tidak ambigu", () => {
    for (const [, cfg] of LEVELS) {
      for (const s of SEEDS) {
        for (const q of buildQuestions(cfg, seeded(s)) as Question[]) {
          const { left: l, right: r } = q;
          expect(cfg.asks).toContain(q.ask);
          for (const v of [l.value, r.value]) {
            expect(v).toBeGreaterThanOrEqual(cfg.min);
            expect(v).toBeLessThanOrEqual(cfg.max);
          }
          expect(q.answer).toBe(compareValues(l.value, r.value, q.ask));
          if (q.answer === "same") expect(l.value).toBe(r.value);
          else expect(Math.abs(l.value - r.value)).toBeGreaterThanOrEqual(cfg.minDiff);
          if (cfg.mode === "items") {
            expect(l.item && r.item).toBeTruthy();
          }
          if (cfg.mode === "calc") {
            expect(evalExpr(l.expr!)).toBe(l.value);
            expect(evalExpr(r.expr!)).toBe(r.value);
            expect(l.expr).not.toBe(r.expr);
            // paling sedikit satu sisi berupa operasi
            expect(l.expr!.includes(" ") || r.expr!.includes(" ")).toBe(true);
            // operasi: operan positif, hasil >= 1 dan <= 10
            for (const e of [l.expr!, r.expr!]) {
              for (const n of e.match(/\d+/g)!) {
                expect(Number(n)).toBeGreaterThanOrEqual(1);
                expect(Number(n)).toBeLessThanOrEqual(10);
              }
            }
          }
        }
      }
    }
  });

  it("perintah dan kalimat hasil benar", () => {
    const qs = buildQuestions(LEVEL_CONFIG.mudah, seeded(1));
    for (const q of qs) {
      expect(q.text).toContain("lebih banyak");
      const hi = Math.max(q.left.value, q.right.value);
      const lo = Math.min(q.left.value, q.right.value);
      expect(q.reveal).toBe(`${hi} lebih banyak dari ${lo}.`);
    }
    const sedang = SEEDS.flatMap((s) => buildQuestions(LEVEL_CONFIG.sedang, seeded(s)));
    expect(sedang.some((q) => q.text.includes("lebih sedikit"))).toBe(true);
    expect(sedang.some((q) => q.text.includes("lebih banyak"))).toBe(true);
  });

  it("kedua sisi di kiri dan kanan seimbang secara acak", () => {
    const qs = SEEDS.flatMap((s) => buildQuestions(LEVEL_CONFIG.mudah, seeded(s)));
    const left = qs.filter((q) => q.answer === "left").length;
    expect(left / qs.length).toBeGreaterThan(0.4);
    expect(left / qs.length).toBeLessThan(0.6);
  });
});
