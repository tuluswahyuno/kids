import type { Session } from "./progress";
import type { AreaId } from "./types";

/**
 * "Misi Hari Ini": 3 aktivitas pendek, seimbang antar bidang, supaya anak tidak
 * hanya memainkan satu game favorit. Murni & deterministik (mudah dites).
 */
export const MISSION_SLOTS: AreaId[][] = [["membaca"], ["berhitung"], ["mengingat", "dunia"]];

export interface MissionItem {
  gameId: string;
  area: AreaId;
  done: boolean;
}

const WEEK = 7 * 24 * 3600 * 1000;

/** Nomor hari menurut zona waktu lokal. */
export function dayNumber(t: number): number {
  return Math.floor((t - new Date(t).getTimezoneOffset() * 60000) / 86400000);
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function pickMission(
  sessions: Session[],
  profileId: string,
  games: { id: string; area: AreaId }[],
  now: number,
): MissionItem[] {
  const today = dayNumber(now);
  const mine = sessions.filter((s) => s.profileId === profileId);
  const recent = (id: string) => mine.filter((s) => s.gameId === id && s.at >= now - WEEK).length;
  const doneToday = (id: string) => mine.some((s) => s.gameId === id && dayNumber(s.at) === today);

  const used = new Set<string>();
  const out: MissionItem[] = [];
  for (const slot of MISSION_SLOTS) {
    const pool = games.filter((g) => slot.includes(g.area) && !used.has(g.id));
    if (!pool.length) continue;
    // game yang sudah dimainkan hari ini tetap di misi (agar centang tidak "pindah"),
    // selain itu pilih yang paling jarang dimainkan; seri diputuskan oleh hash(hari+id).
    const chosen = [...pool].sort((a, b) => {
      const da = doneToday(a.id) ? 0 : 1;
      const db = doneToday(b.id) ? 0 : 1;
      if (da !== db) return da - db;
      const pa = recent(a.id);
      const pb = recent(b.id);
      if (pa !== pb) return pa - pb;
      return hash(`${today}:${a.id}`) - hash(`${today}:${b.id}`);
    })[0];
    used.add(chosen.id);
    out.push({ gameId: chosen.id, area: chosen.area, done: doneToday(chosen.id) });
  }
  return out;
}
