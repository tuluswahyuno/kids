"use client";

import type { CSSProperties, ReactNode } from "react";

/** Baris atas permainan: "Soal 3 dari 10" ........ "⭐ 2" */
export function RoundBar({ left, score }: { left: ReactNode; score: number }) {
  return (
    <div className="roundbar">
      <span>{left}</span>
      <span aria-label={`Skor ${score}`}>⭐ {score}</span>
    </div>
  );
}

/** Bar waktu. fraction 0..1. */
export function TimerBar({ fraction, warn = false, hidden = false }: { fraction: number; warn?: boolean; hidden?: boolean }) {
  return (
    <div className={`timerbar${warn ? " warn" : ""}`} style={{ visibility: hidden ? "hidden" : "visible" }} aria-hidden>
      <i style={{ width: `${Math.max(0, Math.min(1, fraction)) * 100}%` }} />
    </div>
  );
}

export function Msg({ children }: { children?: ReactNode }) {
  return (
    <div className="msg" role="status" aria-live="polite">
      {children}
    </div>
  );
}

export function Stars({ n, of = 3 }: { n: number; of?: number }) {
  return (
    <div className="stars" aria-label={`${n} dari ${of} bintang`}>
      {"⭐".repeat(n)}
      {"☆".repeat(of - n)}
    </div>
  );
}

export function Panel({ children, style, className = "" }: { children: ReactNode; style?: CSSProperties; className?: string }) {
  return (
    <div className={`panel ${className}`} style={style}>
      {children}
    </div>
  );
}

const PRAISE = ["Hebat! 🎉", "Benar! 👏", "Pintar sekali! 🌟", "Yey! 🥳"];
export const praise = (r: number = Math.random()) => PRAISE[Math.floor(r * PRAISE.length)];
