import { describe, expect, it } from "vitest";
import { seeded } from "@/lib/random";
import { buildTray, LEVEL_CONFIG, pickWords, ROUNDS } from "./logic";

describe("susun huruf", () => {
  it("memilih 10 kata unik yang bisa dieja untuk setiap tema dan tingkat", () => {
    for (const cat of ["hewan", "lokal", "buah", "kendaraan", "benda", "semua"]) {
      for (const [lvl, cfg] of Object.entries(LEVEL_CONFIG)) {
        const ws = pickWords(cat, cfg, ROUNDS, seeded(1));
        expect(ws, `${cat}/${lvl}`).toHaveLength(ROUNDS);
        expect(new Set(ws.map((w) => w.text)).size).toBe(ROUNDS);
        ws.forEach((w) => expect(w.text).toMatch(/^[A-Z]+$/));
      }
    }
  });

  it("tingkat mudah memilih kata pendek", () => {
    const ws = pickWords("hewan", LEVEL_CONFIG.mudah, ROUNDS, seeded(2));
    ws.forEach((w) => expect(w.text.length).toBeLessThanOrEqual(6));
  });

  it("nampan berisi semua huruf kata, ditambah pengecoh yang tidak ada di kata", () => {
    const tray = buildTray("GAJAH", 3, seeded(3));
    expect(tray).toHaveLength(8);
    const letters = tray.map((t) => t.ch);
    for (const c of "GAJAH") expect(letters.filter((x) => x === c).length).toBeGreaterThanOrEqual("GAJAH".split(c).length - 1);
    const decoys = tray.filter((t) => !"GAJAH".includes(t.ch));
    expect(decoys).toHaveLength(3);
    expect(new Set(tray.map((t) => t.id)).size).toBe(8);
  });
});
