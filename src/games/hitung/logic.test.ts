import { describe, expect, it } from "vitest";
import { seeded } from "@/lib/random";
import { LEVEL_CONFIG, makeOptions, makeQuestion, stageFor } from "./logic";

const LEVELS = Object.entries(LEVEL_CONFIG);
const SEEDS = Array.from({ length: 300 }, (_, i) => i + 1);

describe("hitung: pilihan jawaban", () => {
  it("memuat jawaban, unik, dalam rentang, jumlah tepat", () => {
    for (const [min, max, count] of [
      [1, 5, 3],
      [1, 10, 4],
      [1, 20, 4],
      [0, 3, 4],
    ] as const) {
      for (let answer = min; answer <= max; answer++) {
        for (const s of [1, 2, 3]) {
          const o = makeOptions(answer, min, max, count, seeded(s * 100 + answer));
          expect(o).toHaveLength(count);
          expect(new Set(o).size).toBe(count);
          expect(o).toContain(answer);
          o.forEach((v) => {
            expect(v).toBeGreaterThanOrEqual(min);
            expect(v).toBeLessThanOrEqual(max);
          });
        }
      }
    }
  });
});

describe("hitung: pembangkit soal", () => {
  it("semua tingkat: jawaban ada di pilihan, pilihan unik, tidak negatif, jumlah sesuai tingkat", () => {
    for (const [lvl, cfg] of LEVELS) {
      for (const s of SEEDS) {
        const q = makeQuestion(cfg, seeded(s));
        const label = `${lvl}/${s}`;
        expect(q.options, label).toHaveLength(cfg.options);
        expect(new Set(q.options).size, label).toBe(cfg.options);
        expect(q.options, label).toContain(q.answer);
        q.options.forEach((v) => {
          expect(v, label).toBeGreaterThanOrEqual(0);
          expect(v, label).toBeLessThanOrEqual(cfg.max);
        });
        expect(q.say.length).toBeGreaterThan(0);
        expect(q.text.length).toBeGreaterThan(0);
      }
    }
  });

  it("tingkat hitung gambar: hanya 'count' dengan jawaban 1..max", () => {
    for (const lvl of ["mudah", "sedang"]) {
      const cfg = LEVEL_CONFIG[lvl];
      const seen = new Set<number>();
      for (const s of SEEDS) {
        const q = makeQuestion(cfg, seeded(s));
        expect(q.kind).toBe("count");
        expect(q.answer).toBeGreaterThanOrEqual(1);
        expect(q.answer).toBeLessThanOrEqual(cfg.max);
        seen.add(q.answer);
      }
      expect(seen.size).toBe(cfg.max); // semua angka pernah keluar
    }
  });

  it("tingkat tambah: a + b = jawaban, a,b >= 1, jumlah <= 10", () => {
    for (const s of SEEDS) {
      const q = makeQuestion(LEVEL_CONFIG.sulit, seeded(s));
      expect(q.kind).toBe("add");
      expect(q.a).toBeGreaterThanOrEqual(1);
      expect(q.b).toBeGreaterThanOrEqual(1);
      expect(q.a + q.b).toBe(q.answer);
      expect(q.answer).toBeLessThanOrEqual(10);
      expect(q.text).toBe(`${q.a} + ${q.b} = ?`);
    }
  });

  it("tingkat campuran: tambah dan kurang muncul; kurang tidak pernah negatif; sampai 20", () => {
    const kinds = new Set<string>();
    for (const s of SEEDS) {
      const q = makeQuestion(LEVEL_CONFIG.ahli, seeded(s));
      kinds.add(q.kind);
      expect(q.answer).toBeGreaterThanOrEqual(1);
      expect(q.answer).toBeLessThanOrEqual(20);
      if (q.kind === "sub") {
        expect(q.a).toBeGreaterThan(q.b);
        expect(q.a - q.b).toBe(q.answer);
        expect(q.say).toContain("kurang");
      } else {
        expect(q.a + q.b).toBe(q.answer);
        expect(q.say).toContain("tambah");
      }
    }
    expect(kinds).toEqual(new Set(["add", "sub"]));
  });

  it("deterministik dengan RNG yang sama", () => {
    expect(makeQuestion(LEVEL_CONFIG.ahli, seeded(42))).toEqual(makeQuestion(LEVEL_CONFIG.ahli, seeded(42)));
  });
});

describe("hitung: tampilan soal", () => {
  it("hitung gambar: kelompok tunggal yang bisa disentuh satu-satu", () => {
    const q = makeQuestion(LEVEL_CONFIG.sedang, seeded(5));
    const st = stageFor(q);
    expect(st.kind).toBe("objects");
    if (st.kind === "objects") {
      expect(st.countable).toBe(true);
      expect(st.groups).toEqual([{ emoji: q.thing.emoji, count: q.answer }]);
    }
  });

  it("tambah sampai 10 selalu memakai gambar; di atas 10 jadi persamaan", () => {
    for (const s of SEEDS) {
      const st = stageFor(makeQuestion(LEVEL_CONFIG.sulit, seeded(s)));
      expect(st.kind).toBe("objects");
    }
    let sawText = false;
    for (const s of SEEDS) {
      const q = makeQuestion(LEVEL_CONFIG.ahli, seeded(s));
      const st = stageFor(q);
      const fits = q.kind === "add" ? q.a + q.b <= 10 : q.a <= 10;
      expect(st.kind).toBe(fits ? "objects" : "text");
      if (st.kind === "text") sawText = true;
      if (st.kind === "objects") {
        expect(st.countable).toBe(false);
        expect(st.groups[0].count).toBe(q.a);
        expect(st.groups[1].count).toBe(q.b);
      }
    }
    expect(sawText).toBe(true);
  });
});
