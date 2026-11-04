import type { Session } from "./progress";
import type { AreaId } from "./types";

/** Bidang belajar = rak kurikulum. Game dikelompokkan ke sini di beranda dan di laporan orang tua. */
export interface AreaInfo {
  id: AreaId;
  title: string;
  emoji: string;
  color: string;
  soft: string;
  blurb: string;
}

export const AREAS: AreaInfo[] = [
  { id: "membaca", title: "Membaca", emoji: "📖", color: "#4c6ef5", soft: "#eef1ff", blurb: "Huruf, suku kata, kata, dan kalimat" },
  { id: "berhitung", title: "Berhitung", emoji: "🔢", color: "#5c940d", soft: "#ebfbee", blurb: "Angka, menghitung, tambah, kurang, bentuk" },
  { id: "mengingat", title: "Mengingat & Fokus", emoji: "🧠", color: "#e8590c", soft: "#fff0e6", blurb: "Daya ingat, perhatian, dan reaksi cepat" },
  { id: "dunia", title: "Mengenal Dunia", emoji: "🌏", color: "#0b7285", soft: "#e3fafc", blurb: "Hewan, benda, dan sekitar kita" },
];

export const areaInfo = (id: AreaId) => AREAS.find((a) => a.id === id)!;

export interface AreaSummary {
  area: AreaId;
  plays: number;
  /** 0..1, rata-rata tertimbang (total skor / total soal) */
  accuracy: number;
}

/** Ringkasan per bidang untuk satu anak sejak `since` (epoch ms). */
export function summarizeByArea(
  sessions: Session[],
  profileId: string,
  since: number,
  areaOf: (gameId: string) => AreaId | undefined,
): AreaSummary[] {
  const acc = new Map<AreaId, { plays: number; score: number; total: number }>();
  for (const s of sessions) {
    if (s.profileId !== profileId || s.at < since) continue;
    const a = areaOf(s.gameId);
    if (!a) continue;
    const cur = acc.get(a) ?? { plays: 0, score: 0, total: 0 };
    cur.plays++;
    cur.score += s.score;
    cur.total += s.total;
    acc.set(a, cur);
  }
  return AREAS.map((ar) => {
    const c = acc.get(ar.id);
    return { area: ar.id, plays: c?.plays ?? 0, accuracy: c && c.total ? c.score / c.total : 0 };
  });
}
