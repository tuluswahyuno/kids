import { describe, expect, it } from "vitest";
import { seeded } from "@/lib/random";
import { BASIC, COLOR_BY_ID, COLORS, isSimilar, OBJECTS, RECIPES } from "./data";
import { buildQuestions, LEVEL_CONFIG, ROUNDS } from "./logic";

const SEEDS = Array.from({ length: 40 }, (_, i) => i + 1);

describe("kenali warna: data", () => {
  it("11 warna unik dengan hex berbeda", () => {
    expect(COLORS).toHaveLength(11);
    expect(new Set(COLORS.map((c) => c.id)).size).toBe(11);
    expect(new Set(COLORS.map((c) => c.hex)).size).toBe(11);
    expect(new Set(COLORS.map((c) => c.name)).size).toBe(11);
  });

  it("benda: warna merujuk warna yang ada, setiap warna punya benda, emoji unik", () => {
    for (const o of OBJECTS) expect(COLOR_BY_ID[o.color]).toBeDefined();
    for (const c of COLORS) expect(OBJECTS.some((o) => o.color === c.id)).toBe(true);
    expect(new Set(OBJECTS.map((o) => o.emoji)).size).toBe(OBJECTS.length);
    expect(OBJECTS.length).toBeGreaterThanOrEqual(ROUNDS);
  });

  it("resep campuran sesuai", () => {
    const has = (a: string, b: string, r: string) =>
      RECIPES.some((x) => x.result === r && ((x.a === a && x.b === b) || (x.a === b && x.b === a)));
    expect(has("merah", "kuning", "oranye")).toBe(true);
    expect(has("biru", "kuning", "hijau")).toBe(true);
    expect(has("merah", "biru", "ungu")).toBe(true);
    expect(has("merah", "putih", "merah-muda")).toBe(true);
    expect(has("hitam", "putih", "abu-abu")).toBe(true);
  });

  it("relasi mirip simetris dan setiap warna punya cukup pengecoh", () => {
    for (const a of COLORS) {
      expect(isSimilar(a.id, a.id)).toBe(false);
      for (const b of COLORS) expect(isSimilar(a.id, b.id)).toBe(isSimilar(b.id, a.id));
      const far = COLORS.filter((c) => c.id !== a.id && !isSimilar(a.id, c.id));
      expect(far.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("kenali warna: soal", () => {
  for (const [lvl, cfg] of Object.entries(LEVEL_CONFIG)) {
    it(`tingkat ${lvl}: 10 soal, jawaban ada di pilihan, pilihan unik, pengecoh tidak mirip`, () => {
      for (const seed of SEEDS) {
        const qs = buildQuestions(lvl, ROUNDS, seeded(seed));
        expect(qs).toHaveLength(ROUNDS);
        for (const q of qs) {
          expect(q.kind).toBe(cfg.kind);
          expect(q.options).toHaveLength(cfg.options);
          expect(new Set(q.options.map((o) => o.id)).size).toBe(cfg.options);
          expect(q.options.filter((o) => o.id === q.answer.id)).toHaveLength(1);
          for (const o of q.options) {
            expect(cfg.pool.some((c) => c.id === o.id)).toBe(true);
            if (o.id !== q.answer.id) expect(isSimilar(o.id, q.answer.id)).toBe(false);
          }
          expect(q.prompt.length).toBeGreaterThan(0);
          expect(q.explain).toContain(q.answer.name);
        }
      }
    });
  }

  it("mudah: hanya warna dasar, tidak ada jawaban sama berurutan", () => {
    for (const seed of SEEDS) {
      const qs = buildQuestions("mudah", ROUNDS, seeded(seed));
      for (let i = 0; i < qs.length; i++) {
        expect(BASIC).toContain(qs[i].answer.id);
        if (i) expect(qs[i].answer.id).not.toBe(qs[i - 1].answer.id);
      }
    }
  });

  it("sedang: 10 warna jawaban berbeda", () => {
    const qs = buildQuestions("sedang", ROUNDS, seeded(2));
    expect(new Set(qs.map((q) => q.answer.id)).size).toBe(ROUNDS);
  });

  it("sulit: benda unik dan jawabannya warna benda itu", () => {
    for (const seed of SEEDS) {
      const qs = buildQuestions("sulit", ROUNDS, seeded(seed));
      expect(new Set(qs.map((q) => q.object!.emoji)).size).toBe(ROUNDS);
      for (const q of qs) expect(q.answer.id).toBe(q.object!.color);
    }
  });

  it("ahli: hasil campuran benar, bahan tidak jadi jawaban, tiap resep dua kali", () => {
    for (const seed of SEEDS) {
      const qs = buildQuestions("ahli", ROUNDS, seeded(seed));
      const counts = new Map<string, number>();
      qs.forEach((q, i) => {
        const { a, b } = q.mix!;
        const r = RECIPES.find((x) => x.result === q.answer.id && ((x.a === a.id && x.b === b.id) || (x.a === b.id && x.b === a.id)));
        expect(r).toBeDefined();
        counts.set(q.answer.id, (counts.get(q.answer.id) ?? 0) + 1);
        if (i) expect(q.answer.id).not.toBe(qs[i - 1].answer.id);
      });
      for (const n of counts.values()) expect(n).toBe(2);
      expect(counts.size).toBe(5);
    }
  });

  it("deterministik untuk seed sama", () => {
    for (const lvl of Object.keys(LEVEL_CONFIG)) {
      expect(JSON.stringify(buildQuestions(lvl, ROUNDS, seeded(11)))).toBe(JSON.stringify(buildQuestions(lvl, ROUNDS, seeded(11))));
    }
  });
});
