import { describe, expect, it } from "vitest";
import { INITIAL_ITEMS, initialOf, itemsStartingWith, LETTERS, letterOf, SIMILAR_GROUPS, similarTo } from "./huruf";

describe("konten huruf", () => {
  it("alfabet lengkap A-Z, unik, dengan nama huruf", () => {
    expect(LETTERS).toHaveLength(26);
    expect(LETTERS.map((l) => l.upper).join("")).toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    expect(new Set(LETTERS.map((l) => l.lower)).size).toBe(26);
    for (const l of LETTERS) {
      expect(l.lower).toBe(l.upper.toLowerCase());
      expect(l.name).toMatch(/^[a-z]+$/);
    }
  });

  it("nama huruf sesuai ejaan Indonesia", () => {
    const names = LETTERS.map((l) => l.name).join(" ");
    expect(names).toBe("a be ce de e ef ge ha i je ka el em en o pe ki er es te u ve we eks ye zet");
    expect(letterOf("q")?.name).toBe("ki");
  });

  it("kelompok mirip hanya berisi huruf valid dan tidak ada duplikat dalam kelompok", () => {
    for (const g of SIMILAR_GROUPS) {
      expect(g.length).toBeGreaterThanOrEqual(2);
      expect(new Set(g).size).toBe(g.length);
      g.forEach((c) => expect(letterOf(c)).toBeDefined());
    }
    expect(similarTo("b")).toEqual(expect.arrayContaining(["d", "p", "q"]));
    expect(similarTo("b")).not.toContain("b");
    expect(similarTo("m")).toEqual(expect.arrayContaining(["n", "w"]));
  });

  it("huruf awal dari nama benda", () => {
    expect(initialOf("Kucing")).toBe("K");
    expect(initialOf("Burung Beo")).toBe("B");
    expect(initialOf("😀")).toBeNull();
    expect(INITIAL_ITEMS.length).toBeGreaterThanOrEqual(40);
    INITIAL_ITEMS.forEach((it) => expect(initialOf(it.name)).not.toBeNull());
    expect(itemsStartingWith("b").length).toBeGreaterThan(0);
  });

  it("cukup banyak huruf awal berbeda untuk 10 soal", () => {
    const initials = new Set(INITIAL_ITEMS.map((it) => initialOf(it.name)));
    expect(initials.size).toBeGreaterThanOrEqual(12);
  });
});
