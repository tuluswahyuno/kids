import { describe, expect, it } from "vitest";
import { itemsFor } from "@/content/items";
import { seeded } from "@/lib/random";
import { buildOptions, choiceCols, LEVEL_CONFIG, pickDeck, questionOrder, ROUNDS } from "./logic";

const CATS = ["hewan", "lokal", "buah", "kendaraan", "benda", "semua"];

describe("tebak kartu", () => {
  it("deck berisi 10 kartu unik untuk setiap tema", () => {
    for (const cat of CATS) {
      const deck = pickDeck(cat, ROUNDS, seeded(1));
      expect(deck, cat).toHaveLength(ROUNDS);
      expect(new Set(deck.map((d) => d.id)).size).toBe(ROUNDS);
    }
  });

  it("jumlah pilihan sesuai tingkat, jawaban benar tepat satu, tidak ada pengecoh kembar", () => {
    for (const cat of CATS) {
      const pool = itemsFor(cat);
      for (const [lvl, cfg] of Object.entries(LEVEL_CONFIG)) {
        const deck = pickDeck(cat, ROUNDS, seeded(7));
        for (const correct of deck) {
          const opts = buildOptions(correct, deck, pool, cfg, seeded(9));
          expect(opts, `${cat}/${lvl}`).toHaveLength(cfg.opts);
          expect(opts.filter((o) => o.id === correct.id)).toHaveLength(1);
          expect(new Set(opts.map((o) => o.id)).size).toBe(cfg.opts);
          expect(new Set(opts.map((o) => o.emoji)).size).toBe(cfg.opts);
        }
      }
    }
  });

  it("tingkat mudah: semua pengecoh dari luar deck (tidak membingungkan)", () => {
    const deck = pickDeck("hewan", ROUNDS, seeded(3));
    const pool = itemsFor("hewan");
    const opts = buildOptions(deck[0], deck, pool, LEVEL_CONFIG.mudah, seeded(4));
    const inDeck = opts.filter((o) => o.id !== deck[0].id && deck.some((d) => d.id === o.id));
    expect(inDeck).toHaveLength(0);
  });

  it("tingkat ahli: sebagian besar pengecoh dari kartu lain di deck", () => {
    const deck = pickDeck("semua", ROUNDS, seeded(5));
    const pool = itemsFor("semua");
    const cfg = LEVEL_CONFIG.ahli;
    const opts = buildOptions(deck[0], deck, pool, cfg, seeded(6));
    const inDeck = opts.filter((o) => o.id !== deck[0].id && deck.some((d) => d.id === o.id));
    expect(inDeck).toHaveLength(Math.round((cfg.opts - 1) * cfg.mix));
  });

  it("tetap menghasilkan cukup pilihan walau pool kecil (jatuh ke kartu deck)", () => {
    const pool = itemsFor("lokal").slice(0, 10);
    const deck = pool.slice();
    const opts = buildOptions(deck[0], deck, pool, { opts: 8, mix: 0 }, seeded(2));
    expect(opts).toHaveLength(8);
    expect(new Set(opts.map((o) => o.id)).size).toBe(8);
  });

  it("urutan pertanyaan: berurutan kecuali tingkat ahli (acak tapi lengkap)", () => {
    expect(questionOrder(10, false)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const o = questionOrder(10, true, seeded(11));
    expect([...o].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(LEVEL_CONFIG.ahli.shuffled).toBe(true);
    expect(LEVEL_CONFIG.sulit.shuffled).toBe(false);
  });

  it("konfigurasi tingkat sesuai prototipe", () => {
    expect(LEVEL_CONFIG.mudah).toMatchObject({ memo: 60, opts: 4, qTime: 0 });
    expect(LEVEL_CONFIG.sedang).toMatchObject({ memo: 45, opts: 6, qTime: 0 });
    expect(LEVEL_CONFIG.sulit).toMatchObject({ memo: 30, opts: 8, qTime: 12 });
    expect(LEVEL_CONFIG.ahli).toMatchObject({ memo: 20, opts: 8, qTime: 8 });
  });

  it("kolom pilihan", () => {
    expect(choiceCols(4)).toBe(4);
    expect(choiceCols(6)).toBe(3);
    expect(choiceCols(8)).toBe(4);
  });
});
