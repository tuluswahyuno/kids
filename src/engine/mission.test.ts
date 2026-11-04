import { describe, expect, it } from "vitest";
import { summarizeByArea } from "./areas";
import { dayNumber, pickMission } from "./mission";
import type { Session } from "./progress";
import type { AreaId } from "./types";

const GAMES: { id: string; area: AreaId }[] = [
  { id: "a1", area: "membaca" },
  { id: "a2", area: "membaca" },
  { id: "h1", area: "berhitung" },
  { id: "m1", area: "mengingat" },
  { id: "d1", area: "dunia" },
];
const NOW = new Date(2026, 10, 3, 10, 0, 0).getTime();
const DAY = 86400000;

const sess = (gameId: string, at: number, score = 5, total = 10): Session => ({
  id: `${gameId}-${at}`, profileId: "p", gameId, levelId: "mudah", category: "x", score, total, at,
});

describe("misi harian", () => {
  it("memilih satu game per slot, tanpa kembar", () => {
    const m = pickMission([], "p", GAMES, NOW);
    expect(m).toHaveLength(3);
    expect(m[0].area).toBe("membaca");
    expect(m[1].area).toBe("berhitung");
    expect(["mengingat", "dunia"]).toContain(m[2].area);
    expect(new Set(m.map((x) => x.gameId)).size).toBe(3);
  });

  it("deterministik pada hari yang sama", () => {
    expect(pickMission([], "p", GAMES, NOW)).toEqual(pickMission([], "p", GAMES, NOW + 3600_000));
  });

  it("memilih game yang paling jarang dimainkan minggu ini", () => {
    const played = [sess("a1", NOW - 2 * DAY), sess("a1", NOW - 3 * DAY)];
    expect(pickMission(played, "p", GAMES, NOW)[0].gameId).toBe("a2");
  });

  it("menandai selesai bila sudah dimainkan hari ini, dan game itu tetap dipilih", () => {
    const m = pickMission([sess("a1", NOW - 3600_000), sess("a1", NOW - DAY)], "p", GAMES, NOW);
    expect(m[0]).toMatchObject({ gameId: "a1", done: true });
  });

  it("mengabaikan sesi anak lain", () => {
    const other = { ...sess("a1", NOW - 1000), profileId: "lain" };
    expect(pickMission([other], "p", GAMES, NOW).every((x) => !x.done)).toBe(true);
  });

  it("dayNumber berganti saat tengah malam lokal", () => {
    const d1 = new Date(2026, 10, 3, 23, 59).getTime();
    const d2 = new Date(2026, 10, 4, 0, 1).getTime();
    expect(dayNumber(d2) - dayNumber(d1)).toBe(1);
  });
});

describe("ringkasan per bidang", () => {
  it("menjumlahkan sesi per bidang dan menghitung akurasi tertimbang", () => {
    const areaOf = (id: string) => GAMES.find((g) => g.id === id)?.area;
    const s = [sess("a1", NOW - DAY, 10, 10), sess("a2", NOW - DAY, 0, 10), sess("h1", NOW - DAY, 8, 10), sess("zzz", NOW - DAY, 1, 1)];
    const r = summarizeByArea(s, "p", NOW - 7 * DAY, areaOf);
    expect(r.find((x) => x.area === "membaca")).toEqual({ area: "membaca", plays: 2, accuracy: 0.5 });
    expect(r.find((x) => x.area === "berhitung")?.accuracy).toBeCloseTo(0.8);
    expect(r.find((x) => x.area === "dunia")).toEqual({ area: "dunia", plays: 0, accuracy: 0 });
  });

  it("mengabaikan sesi di luar jendela waktu", () => {
    const r = summarizeByArea([sess("a1", NOW - 10 * DAY)], "p", NOW - 7 * DAY, () => "membaca");
    expect(r.find((x) => x.area === "membaca")?.plays).toBe(0);
  });
});
