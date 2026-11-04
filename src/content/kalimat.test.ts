import { describe, expect, it } from "vitest";
import { SENTENCES } from "./kalimat";

const cps = (str: string) => Array.from(str).filter((c) => c !== "️" && c !== "‍");
const BAD = ["bunuh", "mati", "darah", "benci", "bodoh", "pukul", "tampar", "setan", "hantu", "senjata", "perang"];

describe("kalimat", () => {
  it("minimal 40 kalimat dengan id unik dan tidak ada duplikat", () => {
    expect(SENTENCES.length).toBeGreaterThanOrEqual(40);
    expect(new Set(SENTENCES.map((x) => x.id)).size).toBe(SENTENCES.length);
    expect(new Set(SENTENCES.map((x) => x.text.toLowerCase())).size).toBe(SENTENCES.length);
  });

  it("scene unik dan tidak ada emoji yang dipakai dua kalimat", () => {
    const all = SENTENCES.flatMap((x) => cps(x.scene));
    expect(new Set(all).size).toBe(all.length);
    SENTENCES.forEach((x) => expect(cps(x.scene).length, x.id).toBeLessThanOrEqual(2));
  });

  it("words cocok dengan text, keyWord ada di words, level sesuai jumlah kata", () => {
    for (const x of SENTENCES) {
      expect(x.words.join(" "), x.id).toBe(x.text.replace(/[.!?,]/g, ""));
      expect(x.text, x.id).toMatch(/^[A-Z].*[.!?]$/);
      expect(x.words.map((w) => w.toLowerCase()), x.id).toContain(x.keyWord);
      const n = x.words.length;
      expect(x.level, x.id).toBe(n <= 3 ? 1 : n === 4 ? 2 : 3);
      expect(n, x.id).toBeGreaterThanOrEqual(2);
      expect(n, x.id).toBeLessThanOrEqual(5);
    }
  });

  it("tiap tingkat punya cukup kalimat dan kata ramah anak", () => {
    for (const lv of [1, 2, 3]) expect(SENTENCES.filter((x) => x.level === lv).length).toBeGreaterThanOrEqual(10);
    for (const x of SENTENCES) for (const b of BAD) expect(x.text.toLowerCase(), x.id).not.toContain(b);
  });
});
