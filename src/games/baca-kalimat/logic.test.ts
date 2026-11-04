import { describe, expect, it } from "vitest";
import { SENTENCES } from "@/content/kalimat";
import { seeded } from "@/lib/random";
import { buildFill, buildQuestions, buildTiles, inRange, LEVEL_CONFIG, ROUNDS } from "./logic";

describe("baca kalimat", () => {
  it("setiap tingkat menghasilkan 10 soal unik dengan panjang kalimat sesuai", () => {
    for (const [lvl, cfg] of Object.entries(LEVEL_CONFIG)) {
      const qs = buildQuestions(cfg, seeded(11));
      expect(qs, lvl).toHaveLength(ROUNDS);
      expect(new Set(qs.map((q) => q.sentence.id)).size, lvl).toBe(ROUNDS);
      qs.forEach((q) => expect(inRange(q.sentence, cfg), `${lvl}/${q.sentence.id}`).toBe(true));
    }
  });

  it("mode pilih gambar: jawaban ada, pilihan unik, scene unik", () => {
    for (const lvl of ["mudah", "sulit"]) {
      const cfg = LEVEL_CONFIG[lvl];
      for (let seed = 1; seed <= 5; seed++) {
        for (const q of buildQuestions(cfg, seeded(seed))) {
          expect(q.options).toHaveLength(cfg.options);
          expect(q.options.map((o) => o.id)).toContain(q.sentence.id);
          expect(new Set(q.options.map((o) => o.id)).size).toBe(cfg.options);
          expect(new Set(q.options.map((o) => o.scene)).size).toBe(cfg.options);
        }
      }
    }
  });

  it("mode isian: jawaban ada di pilihan, pilihan unik, pengecoh tidak ada di kalimat", () => {
    const cfg = LEVEL_CONFIG.sedang;
    for (let seed = 1; seed <= 5; seed++) {
      for (const q of buildQuestions(cfg, seeded(seed))) {
        const answer = q.sentence.words[q.blankIndex];
        expect(q.blankIndex).toBeGreaterThanOrEqual(0);
        expect(q.fillOptions).toHaveLength(cfg.options);
        expect(q.fillOptions).toContain(answer);
        expect(new Set(q.fillOptions.map((w) => w.toLowerCase())).size).toBe(cfg.options);
        const inSentence = q.sentence.words.map((w) => w.toLowerCase());
        q.fillOptions.filter((w) => w !== answer).forEach((w) => expect(inSentence).not.toContain(w.toLowerCase()));
      }
    }
  });

  it("isian: kata di awal kalimat tetap berhuruf kapital", () => {
    const s = SENTENCES.find((x) => x.id === "bulan")!;
    const f = buildFill(s, 3, seeded(2));
    expect(f.blankIndex).toBe(0);
    f.options.forEach((w) => expect(w[0]).toBe(w[0].toUpperCase()));
  });

  it("mode susun: tile memuat semua kata dan tidak sudah berurutan", () => {
    for (const s of SENTENCES) {
      const tiles = buildTiles(s, seeded(9));
      expect(tiles.map((t) => t.word).sort()).toEqual([...s.words].sort());
      expect(tiles.every((t, i) => t.id === i), s.id).toBe(false);
    }
  });

  it("deterministik dengan seeded()", () => {
    for (const cfg of Object.values(LEVEL_CONFIG)) {
      const f = () => JSON.stringify(buildQuestions(cfg, seeded(77)));
      expect(f()).toBe(f());
    }
  });

  it("tingkat: 2 gratis pertama dan struktur mode", () => {
    expect(LEVEL_CONFIG.mudah.mode).toBe("pick");
    expect(LEVEL_CONFIG.sedang.mode).toBe("fill");
    expect(LEVEL_CONFIG.ahli.mode).toBe("arrange");
  });
});
