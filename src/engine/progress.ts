"use client";

import { createPersistentStore } from "@/lib/store";

export interface Session {
  id: string;
  profileId: string;
  gameId: string;
  levelId: string;
  category: string;
  score: number;
  total: number;
  /** epoch ms */
  at: number;
  /** sudah terkirim ke server? (dipakai sinkronisasi nanti) */
  synced?: boolean;
}

interface ProgressState {
  sessions: Session[];
}

const MAX_SESSIONS = 1000;

export const progressStore = createPersistentStore<ProgressState>("mp.progress.v1", { sessions: [] });
export const useProgress = () => progressStore.use();

const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now() + Math.random()));

export function recordSession(s: Omit<Session, "id" | "at">): Session {
  const session: Session = { ...s, id: uid(), at: Date.now() };
  progressStore.set((p) => ({ sessions: [...p.sessions, session].slice(-MAX_SESSIONS) }));
  return session;
}

/** Skor terbaik untuk kombinasi tertentu; null jika belum pernah main. */
export function bestScore(
  state: ProgressState,
  q: { profileId: string; gameId: string; levelId: string; category: string },
): number | null {
  let best: number | null = null;
  for (const s of state.sessions) {
    if (s.profileId === q.profileId && s.gameId === q.gameId && s.levelId === q.levelId && s.category === q.category) {
      best = best === null ? s.score : Math.max(best, s.score);
    }
  }
  return best;
}

export const starsFor = (score: number, total: number): 0 | 1 | 2 | 3 => {
  const r = total ? score / total : 0;
  return r >= 0.9 ? 3 : r >= 0.6 ? 2 : r >= 0.3 ? 1 : 0;
};

export interface GameSummary {
  gameId: string;
  plays: number;
  accuracy: number; // 0..1
  stars: number;
}

export function summarize(state: ProgressState, profileId: string, sinceMs = 0): GameSummary[] {
  const by = new Map<string, { plays: number; score: number; total: number; stars: number }>();
  for (const s of state.sessions) {
    if (s.profileId !== profileId || s.at < sinceMs) continue;
    const a = by.get(s.gameId) ?? { plays: 0, score: 0, total: 0, stars: 0 };
    a.plays++;
    a.score += s.score;
    a.total += s.total;
    a.stars += starsFor(s.score, s.total);
    by.set(s.gameId, a);
  }
  return [...by.entries()].map(([gameId, a]) => ({
    gameId,
    plays: a.plays,
    accuracy: a.total ? a.score / a.total : 0,
    stars: a.stars,
  }));
}

/** Total bintang: bintang terbaik untuk setiap kombinasi game/tingkat/tema. */
export function totalStars(state: ProgressState, profileId: string): number {
  const best = new Map<string, number>();
  for (const s of state.sessions) {
    if (s.profileId !== profileId) continue;
    const k = `${s.gameId}|${s.levelId}|${s.category}`;
    best.set(k, Math.max(best.get(k) ?? 0, starsFor(s.score, s.total)));
  }
  let n = 0;
  best.forEach((v) => (n += v));
  return n;
}

/** Jumlah hari berturut-turut (sampai hari ini) dengan setidaknya satu sesi. */
export function streakDays(state: ProgressState, profileId: string, now = Date.now()): number {
  const day = (t: number) => Math.floor((t - new Date(t).getTimezoneOffset() * 60000) / 86400000);
  const days = new Set(state.sessions.filter((s) => s.profileId === profileId).map((s) => day(s.at)));
  let d = day(now);
  if (!days.has(d)) d -= 1; // hari ini belum main tidak memutus streak kemarin
  let n = 0;
  while (days.has(d)) {
    n++;
    d--;
  }
  return n;
}
