import { describe, expect, it } from "vitest";
import { ITEMS } from "./items";
import { hyphenate } from "./baca-kata";

describe("hyphenate", () => {
  it("memenggal kata umum dengan benar", () => {
    const cases: Record<string, string[]> = {
      Kucing: ["Ku", "cing"],
      Gajah: ["Ga", "jah"],
      Mangga: ["Mang", "ga"],
      Anggur: ["Ang", "gur"],
      Ambulans: ["Am", "bu", "lans"],
      Kerbau: ["Ker", "bau"],
      Traktor: ["Trak", "tor"],
      Stroberi: ["Stro", "be", "ri"],
      Helikopter: ["He", "li", "kop", "ter"],
      Penyu: ["Pe", "nyu"],
      Bola: ["Bo", "la"],
      Ikan: ["I", "kan"],
      Bus: ["Bus"],
      Apel: ["A", "pel"],
    };
    for (const [w, s] of Object.entries(cases)) expect(hyphenate(w), w).toEqual(s);
  });

  it("tidak merusak huruf dan tiap suku kata punya vokal untuk semua nama item", () => {
    for (const it of ITEMS) {
      const syl = hyphenate(it.name);
      expect(syl.join(""), it.id).toBe(it.name.replace(/[\s-]+/g, ""));
      syl.forEach((s) => expect(s, `${it.id}:${s}`).toMatch(/[aiueoAIUEO]/));
    }
  });

  it("kata dengan karakter lain dikembalikan utuh", () => {
    expect(hyphenate("a1b")).toEqual(["a1b"]);
  });
});
