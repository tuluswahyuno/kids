import { describe, expect, it } from "vitest";
import { ANIMALS, CATEGORY_INFO, isSpellable, ITEMS, itemsFor, numberWord } from "./items";

describe("konten", () => {
  it("id unik dan tidak kosong", () => {
    const ids = ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toMatch(/^[a-z0-9-]+$/));
  });

  it("setiap item punya emoji, nama, dan kategori", () => {
    for (const it of ITEMS) {
      expect(it.emoji.length).toBeGreaterThan(0);
      expect(it.name.length).toBeGreaterThan(0);
      expect(it.categories.length).toBeGreaterThan(0);
    }
  });

  it("emoji tidak ada yang kembar di dalam satu kategori (supaya pilihan tidak ambigu)", () => {
    for (const c of CATEGORY_INFO) {
      const e = itemsFor(c.id).map((i) => i.emoji);
      expect(new Set(e).size, `kategori ${c.id}`).toBe(e.length);
    }
  });

  it("tiap kategori cukup besar untuk 10 soal dengan pengecoh", () => {
    for (const c of CATEGORY_INFO) expect(itemsFor(c.id).length, c.id).toBeGreaterThanOrEqual(16);
  });

  it("tiap kategori punya >= 10 kata yang bisa dieja (game huruf)", () => {
    for (const c of CATEGORY_INFO) expect(itemsFor(c.id).filter(isSpellable).length, c.id).toBeGreaterThanOrEqual(10);
  });

  it("hewan bersuara: cukup untuk 10 soal + 5 pengecoh dan datanya lengkap", () => {
    expect(ANIMALS.length).toBeGreaterThanOrEqual(15);
    for (const a of ANIMALS) {
      expect(a.animal!.sound.length).toBeGreaterThan(0);
      expect(a.animal!.soundText.length).toBeGreaterThan(0);
      expect(a.animal!.clue.length).toBeGreaterThan(10);
      expect(a.animal!.pitch).toBeGreaterThan(0);
      expect(a.animal!.pitch).toBeLessThanOrEqual(2);
    }
  });

  it("kata bilangan 0..20", () => {
    expect(numberWord(0)).toBe("nol");
    expect(numberWord(7)).toBe("tujuh");
    expect(numberWord(20)).toBe("dua puluh");
  });
});
