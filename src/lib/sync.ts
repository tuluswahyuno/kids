import type { Profile } from "@/engine/profiles";
import type { Session } from "@/engine/progress";

/** Fungsi murni untuk sinkronisasi: memetakan data lokal ke baris tabel Supabase. */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (s: string) => UUID.test(s);

export interface ChildRow {
  id: string;
  parent_id: string;
  name: string;
  avatar: string;
}
export interface SessionRow {
  id: string;
  child_id: string;
  game_id: string;
  level_id: string;
  category: string;
  score: number;
  total: number;
  played_at: string;
}

export const toChildRow = (p: Profile, parentId: string): ChildRow => ({
  id: p.id,
  parent_id: parentId,
  name: p.name.slice(0, 20) || "Anak",
  avatar: p.avatar,
});

export const toSessionRow = (s: Session): SessionRow => ({
  id: s.id,
  child_id: s.profileId,
  game_id: s.gameId,
  level_id: s.levelId,
  category: s.category,
  score: s.score,
  total: s.total,
  played_at: new Date(s.at).toISOString(),
});

/** Sesi yang layak dikirim: belum terkirim, id valid (UUID), dan lolos batasan tabel. */
export function pendingSessions(sessions: Session[], profiles: Profile[]): Session[] {
  const known = new Set(profiles.map((p) => p.id));
  return sessions.filter(
    (s) =>
      !s.synced &&
      isUuid(s.id) &&
      isUuid(s.profileId) &&
      known.has(s.profileId) &&
      s.total > 0 &&
      s.score >= 0 &&
      s.score <= s.total,
  );
}

export function chunk<T>(a: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < a.length; i += size) out.push(a.slice(i, i + size));
  return out;
}

/** Gabungkan sesi dari server ke lokal tanpa duplikat (kunci: id). Hasil terurut menurut waktu. */
export function mergeSessions(local: Session[], remote: Session[]): Session[] {
  const byId = new Map(local.map((s) => [s.id, s]));
  for (const r of remote) if (!byId.has(r.id)) byId.set(r.id, { ...r, synced: true });
  return [...byId.values()].sort((a, b) => a.at - b.at);
}

export const fromSessionRow = (r: SessionRow): Session => ({
  id: r.id,
  profileId: r.child_id,
  gameId: r.game_id,
  levelId: r.level_id,
  category: r.category,
  score: r.score,
  total: r.total,
  at: Date.parse(r.played_at),
  synced: true,
});

export const fromChildRow = (r: ChildRow): Profile => ({ id: r.id, name: r.name, avatar: r.avatar, createdAt: 0 });
