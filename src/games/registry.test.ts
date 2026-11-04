import { describe, expect, it } from "vitest";
import { AREAS } from "@/engine/areas";
import { totalFor } from "@/engine/types";
import { GAMES } from "./registry";

describe("registri game", () => {
  it("id unik dan berformat slug", () => {
    const ids = GAMES.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/));
  });

  it("setiap game punya bidang valid, kemampuan, judul, dan warna", () => {
    const areas = new Set(AREAS.map((a) => a.id));
    for (const g of GAMES) {
      expect(areas.has(g.area), g.id).toBe(true);
      expect(g.skill.length, g.id).toBeGreaterThan(5);
      expect(g.title.length).toBeGreaterThan(2);
      expect(g.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(g.soft).toMatch(/^#[0-9a-f]{6}$/i);
      expect(g.tempo).toBeGreaterThanOrEqual(80);
      expect(g.tempo).toBeLessThanOrEqual(140);
    }
  });

  it("tingkat: id unik, minimal 2 tingkat gratis, tingkat pertama tidak premium, total > 0", () => {
    for (const g of GAMES) {
      const lvIds = g.levels.map((l) => l.id);
      expect(new Set(lvIds).size, g.id).toBe(lvIds.length);
      expect(g.levels[0].premium, g.id).toBeFalsy();
      expect(g.levels.filter((l) => !l.premium).length, g.id).toBeGreaterThanOrEqual(2);
      for (const l of g.levels) expect(totalFor(g, l), `${g.id}/${l.id}`).toBeGreaterThan(0);
    }
  });

  it("kategori: id unik dan defaultCategory ada di daftar", () => {
    for (const g of GAMES.filter((x) => x.categories)) {
      const ids = g.categories!.map((c) => c.id);
      expect(new Set(ids).size, g.id).toBe(ids.length);
      if (g.defaultCategory) expect(ids, g.id).toContain(g.defaultCategory);
    }
  });

  it("setiap bidang punya setidaknya satu game (supaya beranda tidak kosong)", () => {
    for (const a of AREAS) expect(GAMES.some((g) => g.area === a.id), a.id).toBe(true);
  });
});
