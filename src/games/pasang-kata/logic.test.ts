import { describe, expect, it } from "vitest";
import { seeded } from "@/lib/random";
import { LEVEL_CONFIG, pickBoards, shuffleDifferent, totalPairs } from "./logic";

const CATS = ["hewan", "lokal", "buah", "kendaraan", "benda", "semua"];

describe("pasangkan kata", () => {
  it("total pasangan: mudah 9, sedang 12, sulit 10", () => {
    expect(totalPairs(LEVEL_CONFIG.mudah)).toBe(9);
    expect(totalPairs(LEVEL_CONFIG.sedang)).toBe(12);
    expect(totalPairs(LEVEL_CONFIG.sulit)).toBe(10);
  });

  it("papan sesuai konfigurasi dan tidak ada item yang terulang di seluruh papan", () => {
    for (const cat of CATS) {
      for (const [lvl, cfg] of Object.entries(LEVEL_CONFIG)) {
        const boards = pickBoards(cat, cfg, seeded(1));
        expect(boards, `${cat}/${lvl}`).toHaveLength(cfg.boards);
        boards.forEach((b) => expect(b).toHaveLength(cfg.per));
        const ids = boards.flat().map((i) => i.id);
        expect(new Set(ids).size).toBe(totalPairs(cfg));
        // nama dan emoji unik supaya pasangan tidak ambigu
        expect(new Set(boards.flat().map((i) => i.name)).size).toBe(ids.length);
        expect(new Set(boards.flat().map((i) => i.emoji)).size).toBe(ids.length);
      }
    }
  });

  it("urutan kata berisi item yang sama dengan papan dan tidak sejajar sempurna", () => {
    const [board] = pickBoards("hewan", LEVEL_CONFIG.sulit, seeded(4));
    for (let s = 0; s < 20; s++) {
      const words = shuffleDifferent(board, seeded(s));
      expect(words.map((w) => w.id).sort()).toEqual(board.map((b) => b.id).sort());
      expect(words.every((w, k) => w.id === board[k].id)).toBe(false);
    }
  });
});
