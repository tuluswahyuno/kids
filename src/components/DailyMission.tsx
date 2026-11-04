"use client";

import Link from "next/link";
import { useState } from "react";
import { areaInfo } from "@/engine/areas";
import { pickMission } from "@/engine/mission";
import { activeProfile, useProfiles } from "@/engine/profiles";
import { useProgress } from "@/engine/progress";
import { GAMES, gameById } from "@/games/registry";

/** "Misi Hari Ini": 3 aktivitas pendek seimbang antar bidang. Centang bila sudah dimainkan hari ini. */
export function DailyMission() {
  const profiles = useProfiles();
  const progress = useProgress();
  const [now] = useState(() => Date.now());

  const me = activeProfile(profiles);
  if (!me) return null;

  const mission = pickMission(
    progress.sessions,
    me.id,
    GAMES.map((g) => ({ id: g.id, area: g.area })),
    now,
  );
  const doneCount = mission.filter((m) => m.done).length;

  return (
    <section className="panel mission" aria-labelledby="mission-title">
      <div className="mission-head">
        <h2 id="mission-title">🎯 Misi Hari Ini</h2>
        <span className="chip">{doneCount}/{mission.length}</span>
      </div>
      {doneCount === mission.length ? (
        <p className="mission-win">Hebat, {me.name}! Semua misi hari ini selesai 🎉</p>
      ) : (
        <p className="sub" style={{ textAlign: "left" }}>Main sebentar saja, 3 permainan pendek.</p>
      )}
      <div className="mission-list">
        {mission.map((m) => {
          const g = gameById(m.gameId)!;
          const a = areaInfo(m.area);
          return (
            <Link
              key={m.gameId}
              href={`/game/${g.id}/`}
              className={`mission-card${m.done ? " done" : ""}`}
              style={{ ["--accent" as string]: g.color, background: m.done ? "#d3f9d8" : g.soft }}
              aria-label={`${g.title}, bidang ${a.title}${m.done ? ", sudah selesai" : ""}`}
            >
              <span className="mc-emoji" aria-hidden>
                {m.done ? "✅" : g.emoji}
              </span>
              <b>{g.title}</b>
              <small>{a.emoji} {a.title}</small>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
