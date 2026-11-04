import { describe, expect, it } from "vitest";
import { seeded } from "@/lib/random";
import { confusable, OBJECTS, SHAPE_IDS, type ShapeId } from "./data";
import { buildPatternQuestion, buildQuestions, LEVEL_CONFIG, repsFor, ROUNDS, tokenKey, type Question } from "./logic";

const SEEDS = Array.from({ length: 40 }, (_, i) => i + 1);

function common(q: Question) {
  expect(q.options.length).toBeGreaterThanOrEqual(3);
  expect(new Set(q.options.map((o) => o.id)).size).toBe(q.options.length);
  expect(q.options.filter((o) => o.id === q.answerId)).toHaveLength(1);
  expect(q.prompt.length).toBeGreaterThan(0);
  expect(q.explain.length).toBeGreaterThan(0);
}

describe("bentuk & pola: umum", () => {
  for (const lvl of Object.keys(LEVEL_CONFIG)) {
    it(`tingkat ${lvl}: 10 soal valid, jawaban ada di pilihan, pilihan unik`, () => {
      for (const seed of SEEDS) {
        const qs = buildQuestions(lvl, ROUNDS, seeded(seed));
        expect(qs).toHaveLength(ROUNDS);
        qs.forEach(common);
      }
    });
  }

  it("deterministik untuk seed sama", () => {
    for (const lvl of Object.keys(LEVEL_CONFIG)) {
      const a = JSON.stringify(buildQuestions(lvl, ROUNDS, seeded(9)));
      const b = JSON.stringify(buildQuestions(lvl, ROUNDS, seeded(9)));
      expect(a).toBe(b);
    }
  });
});

describe("bentuk & pola: mudah", () => {
  it("3 pilihan nama, persegi & persegi panjang tidak berdampingan, semua bentuk muncul", () => {
    const seen = new Set<string>();
    for (const seed of SEEDS) {
      for (const q of buildQuestions("mudah", ROUNDS, seeded(seed))) {
        expect(q.options).toHaveLength(3);
        const ids = q.options.map((o) => o.id as ShapeId);
        for (const a of ids) for (const b of ids) if (a !== b) expect(confusable(a, b)).toBe(false);
        expect(q.target?.shape).toBe(q.answerId);
        seen.add(q.answerId);
      }
    }
    expect(seen.size).toBe(SHAPE_IDS.length);
  });

  it("tidak ada soal sama berurutan", () => {
    const qs = buildQuestions("mudah", ROUNDS, seeded(3));
    for (let i = 1; i < qs.length; i++) expect(qs[i].answerId).not.toBe(qs[i - 1].answerId);
  });
});

describe("bentuk & pola: sedang", () => {
  it("5 soal benda + 5 soal bentuk sama", () => {
    const qs = buildQuestions("sedang", ROUNDS, seeded(5));
    expect(qs.filter((q) => q.kind === "object")).toHaveLength(5);
    expect(qs.filter((q) => q.kind === "same")).toHaveLength(5);
  });

  it("soal benda: jawaban benar-benar berbentuk itu, pengecoh bukan", () => {
    for (const seed of SEEDS) {
      for (const q of buildQuestions("sedang", ROUNDS, seeded(seed)).filter((x) => x.kind === "object")) {
        expect(q.options).toHaveLength(3);
        const shape = q.target!.shape;
        const own = new Set(OBJECTS[shape].map((o) => o.emoji));
        expect(own.has(q.answerId)).toBe(true);
        for (const o of q.options) if (o.id !== q.answerId) expect(own.has(o.id)).toBe(false);
      }
    }
  });

  it("data benda: tiap bentuk punya benda, emoji tidak dipakai dua bentuk", () => {
    const all = SHAPE_IDS.flatMap((s) => OBJECTS[s].map((o) => o.emoji));
    expect(new Set(all).size).toBe(all.length);
    for (const s of SHAPE_IDS) expect(OBJECTS[s].length).toBeGreaterThanOrEqual(2);
  });

  it("soal bentuk sama: hanya satu bentuk sama, beda warna & ukuran; pengecoh bentuk lain", () => {
    for (const seed of SEEDS) {
      for (const q of buildQuestions("sedang", ROUNDS, seeded(seed)).filter((x) => x.kind === "same")) {
        expect(q.options).toHaveLength(3);
        const same = q.options.filter((o) => o.token!.shape === q.target!.shape);
        expect(same).toHaveLength(1);
        expect(same[0].id).toBe(q.answerId);
        expect(same[0].token!.color).not.toBe(q.target!.color);
        expect(same[0].scale).toBeLessThan(1 + 1e-9);
        // satu pengecoh memakai warna yang sama dengan soal
        expect(q.options.some((o) => o.id !== q.answerId && o.token!.color === q.target!.color)).toBe(true);
        const shapes = q.options.map((o) => o.token!.shape);
        for (const a of shapes) for (const b of shapes) if (a !== b) expect(confusable(a, b)).toBe(false);
      }
    }
  });
});

describe("bentuk & pola: pola", () => {
  const cases: Array<[string, "end" | "middle"]> = [
    ["AB", "end"],
    ["AAB", "end"],
    ["ABB", "end"],
    ["ABC", "middle"],
    ["ABBA", "middle"],
    ["ABAC", "middle"],
  ];

  for (const [pattern, blankAt] of cases) {
    it(`pola ${pattern} (${blankAt}): jawaban unik dan konsisten`, () => {
      for (const seed of SEEDS) {
        const q = buildPatternQuestion(pattern, blankAt, seeded(seed));
        common(q);
        expect(q.options).toHaveLength(4);
        const seq = q.sequence!;
        const letters = q.pattern!;
        const blank = q.blank!;
        expect(seq).toHaveLength(letters.length);
        expect(seq).toHaveLength(pattern.length * repsFor(pattern) + (blankAt === "end" ? 1 : 0));
        expect(seq[blank]).toBeNull();
        expect(seq.filter((t) => t === null)).toHaveLength(1);

        if (blankAt === "end") expect(blank).toBe(seq.length - 1);
        else {
          expect(blank).toBeGreaterThan(0);
          expect(blank).toBeLessThan(seq.length - 1);
        }

        // konsistensi pola: huruf sama -> token sama, huruf beda -> token beda
        const map = new Map<string, string>();
        seq.forEach((t, i) => {
          if (!t) return;
          const k = tokenKey(t);
          const prev = map.get(letters[i]);
          if (prev) expect(prev).toBe(k);
          else map.set(letters[i], k);
        });
        expect(new Set(map.values()).size).toBe(map.size);

        // jawaban = token huruf bagian yang hilang, dan huruf itu terlihat di tempat lain (unik)
        const missing = letters[blank];
        expect(map.has(missing)).toBe(true);
        expect(q.answerId).toBe(map.get(missing));
        // tidak ada pengecoh yang sama dengan jawaban, tak ada pilihan lain yang cocok dengan pola
        const wrong = q.options.filter((o) => o.id !== q.answerId);
        expect(wrong).toHaveLength(3);
        for (const o of wrong) expect(o.id).not.toBe(map.get(missing));

        // pembeda selain warna: tiap pasang pilihan berbeda bentuk atau pola isi
        for (const a of q.options)
          for (const b of q.options)
            if (a !== b) expect(a.token!.shape !== b.token!.shape || a.token!.fill !== b.token!.fill).toBe(true);

        // tidak ada persegi bersama persegi panjang
        const shapes = q.options.map((o) => o.token!.shape);
        for (const a of shapes) for (const b of shapes) if (a !== b) expect(confusable(a, b)).toBe(false);
      }
    });
  }

  it("tingkat sulit: tanda tanya di akhir; tingkat ahli: di tengah", () => {
    for (const seed of SEEDS) {
      for (const q of buildQuestions("sulit", ROUNDS, seeded(seed))) expect(q.blank).toBe(q.sequence!.length - 1);
      for (const q of buildQuestions("ahli", ROUNDS, seeded(seed))) {
        expect(q.blank).toBeGreaterThan(0);
        expect(q.blank).toBeLessThan(q.sequence!.length - 1);
      }
    }
  });

  it("pola yang dipakai sesuai tingkat", () => {
    const sulit = new Set<string>();
    const ahli = new Set<string>();
    for (const seed of SEEDS) {
      buildQuestions("sulit", ROUNDS, seeded(seed)).forEach((q) => sulit.add(q.pattern!.slice(0, 3)));
      buildQuestions("ahli", ROUNDS, seeded(seed)).forEach((q) => ahli.add(q.pattern!.slice(0, 3)));
    }
    expect(sulit.size).toBeGreaterThanOrEqual(3);
    expect([...ahli].some((p) => p === "ABC")).toBe(true);
    expect([...ahli].some((p) => p.startsWith("ABB") || p.startsWith("ABA"))).toBe(true);
  });
});
