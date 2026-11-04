import { describe, expect, it } from "vitest";
import { seeded } from "@/lib/random";
import {
  BALLOON_COLORS,
  buildRound,
  correctSpeech,
  LEVEL_CONFIG,
  missSpeech,
  parseMode,
  pickTargets,
  poolFor,
  promptSpeech,
  roundTimeoutMs,
  STAGGER,
  ROUNDS,
} from "./logic";

const LEVELS = Object.entries(LEVEL_CONFIG);

describe("pecah balon", () => {
  it("kecepatan dan jumlah balon sesuai prototipe", () => {
    expect(LEVELS.map(([, c]) => c.dur)).toEqual([7, 5, 3.8, 2.8]);
    expect(LEVELS.map(([, c]) => c.balloons)).toEqual([4, 6, 8, 9]);
  });

  it("parseMode: angka atau (default) huruf", () => {
    expect(parseMode("angka")).toBe("angka");
    expect(parseMode("huruf")).toBe("huruf");
    expect(parseMode("-")).toBe("huruf");
  });

  it("kolam huruf A–Z dan kolam angka 1..max", () => {
    expect(poolFor("huruf", LEVEL_CONFIG.mudah)).toHaveLength(26);
    for (const [, cfg] of LEVELS) {
      const nums = poolFor("angka", cfg);
      expect(nums[0]).toBe(1);
      expect(nums[nums.length - 1]).toBe(cfg.maxNum);
    }
  });

  it("target: 10 buah, semua dari kolam; tidak berulang bila kolam cukup", () => {
    for (const mode of ["huruf", "angka"] as const) {
      for (const [lvl, cfg] of LEVELS) {
        const t = pickTargets(mode, cfg, ROUNDS, seeded(7));
        expect(t, `${mode}/${lvl}`).toHaveLength(ROUNDS);
        const pool = poolFor(mode, cfg);
        t.forEach((v) => expect(pool).toContain(v));
        if (pool.length >= ROUNDS) expect(new Set(t).size).toBe(ROUNDS);
      }
    }
  });

  it("putaran: jumlah balon sesuai, nilai berbeda-beda, target tepat satu", () => {
    for (const mode of ["huruf", "angka"] as const) {
      for (const [lvl, cfg] of LEVELS) {
        for (let s = 1; s <= 40; s++) {
          const rng = seeded(s);
          const target = pickTargets(mode, cfg, 1, rng)[0];
          const r = buildRound(mode, cfg, target, s, rng);
          const label = `${mode}/${lvl}/${s}`;
          expect(r.balloons, label).toHaveLength(cfg.balloons);
          const values = r.balloons.map((b) => b.value);
          expect(new Set(values).size, label).toBe(cfg.balloons);
          expect(values.filter((v) => v === target), label).toHaveLength(1);
          const pool = poolFor(mode, cfg);
          values.forEach((v) => expect(pool).toContain(v));
          expect(new Set(r.balloons.map((b) => b.id)).size).toBe(cfg.balloons);
        }
      }
    }
  });

  it("angka selalu dalam 1..maxNum per tingkat", () => {
    for (const [, cfg] of LEVELS) {
      const r = buildRound("angka", cfg, 1, 0, seeded(3));
      r.balloons.forEach((b) => {
        expect(b.value).toBeGreaterThanOrEqual(1);
        expect(b.value).toBeLessThanOrEqual(cfg.maxNum);
      });
    }
  });

  it("posisi 0..1, durasi wajar, balon target lebih lambat dari batas bawah, warna valid", () => {
    for (const [, cfg] of LEVELS) {
      const r = buildRound("huruf", cfg, "B", 2, seeded(11));
      for (const b of r.balloons) {
        expect(b.frac).toBeGreaterThanOrEqual(0);
        expect(b.frac).toBeLessThanOrEqual(1);
        expect(b.duration).toBeGreaterThanOrEqual(cfg.dur * 0.9);
        expect(b.duration).toBeLessThanOrEqual(cfg.dur * 1.2 + 0.4 + 1e-9);
        expect(b.color).toBeGreaterThanOrEqual(0);
        expect(b.color).toBeLessThan(BALLOON_COLORS.length);
        if (b.value === "B") expect(b.duration).toBeGreaterThanOrEqual(cfg.dur * 0.9 + 0.4);
      }
    }
  });

  it("batas waktu putaran = durasi + 0,3 detik (+ jeda bila balon banyak)", () => {
    expect(roundTimeoutMs(LEVEL_CONFIG.mudah)).toBe(7300);
    const a = LEVEL_CONFIG.ahli;
    expect(roundTimeoutMs(a)).toBe(Math.round(a.dur * 1000 + 300 + a.dur * STAGGER * 1000));
  });

  it("balon ganjil diberi jeda hanya bila balon >= 6", () => {
    const few = buildRound("huruf", LEVEL_CONFIG.mudah, "A", 1, seeded(1));
    expect(few.balloons.every((b) => b.delay === 0)).toBe(true);
    const many = buildRound("huruf", LEVEL_CONFIG.ahli, "A", 1, seeded(1));
    expect(many.balloons.filter((b) => b.delay > 0).length).toBe(Math.floor(many.balloons.length / 2));
  });

  it("kalimat ucapan: angka dibacakan dengan kata", () => {
    expect(promptSpeech("huruf", "B")).toBe("Pecahkan huruf B");
    expect(promptSpeech("angka", 7)).toBe("Pecahkan angka tujuh");
    expect(correctSpeech("angka", 12)).toBe("Benar! dua belas");
    expect(correctSpeech("huruf", "K")).toBe("Benar! Huruf K");
    expect(missSpeech("angka", 3)).toContain("tiga");
  });
});
