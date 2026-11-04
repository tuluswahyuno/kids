import { describe, expect, it } from "vitest";
import type { Profile } from "@/engine/profiles";
import type { Session } from "@/engine/progress";
import { chunk, fromSessionRow, isUuid, mergeSessions, pendingSessions, toSessionRow } from "./sync";

const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";
const P = "33333333-3333-4333-8333-333333333333";
const profile: Profile = { id: P, name: "Dina", avatar: "🦁", createdAt: 1 };
const sess = (o: Partial<Session> = {}): Session => ({ id: A, profileId: P, gameId: "hitung", levelId: "mudah", category: "x", score: 5, total: 10, at: 1000, ...o });

describe("sync", () => {
  it("isUuid", () => {
    expect(isUuid(A)).toBe(true);
    expect(isUuid("123.456")).toBe(false);
  });

  it("pendingSessions hanya yang valid & belum terkirim", () => {
    const list = [
      sess(),
      sess({ id: B, synced: true }),
      sess({ id: "bukan-uuid" }),
      sess({ id: "44444444-4444-4444-8444-444444444444", score: 11 }),
      sess({ id: "55555555-5555-4555-8555-555555555555", profileId: "66666666-6666-4666-8666-666666666666" }),
    ];
    expect(pendingSessions(list, [profile]).map((s) => s.id)).toEqual([A]);
  });

  it("pemetaan baris bolak-balik", () => {
    const s = sess();
    const back = fromSessionRow(toSessionRow(s));
    expect(back).toEqual({ ...s, synced: true });
  });

  it("mergeSessions tanpa duplikat, terurut, lokal menang", () => {
    const local = [sess({ id: A, at: 2000 })];
    const remote = [sess({ id: A, at: 9 }), sess({ id: B, at: 1000 })];
    const m = mergeSessions(local, remote);
    expect(m.map((s) => s.id)).toEqual([B, A]);
    expect(m[1].at).toBe(2000);
  });

  it("chunk", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
});
