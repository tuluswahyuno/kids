"use client";

import { useEffect, useRef, useState } from "react";
import { sfx, speak } from "@/engine/audio";
import { useSettings } from "@/engine/settings";
import { useTimers } from "@/engine/timers";
import type { PlayProps } from "@/engine/types";
import { Msg, praise, RoundBar } from "@/engine/ui";
import { buildQuestions, LEVEL_CONFIG, revealSpeech, ROUNDS, type Answer, type Question, type Side } from "./logic";
import css from "./Bandingkan.module.css";

function sideLabel(q: Question, s: Side, pos: "kiri" | "kanan"): string {
  if (q.mode === "items") return `Kelompok ${pos}, ${s.item!.name.toLowerCase()}`;
  if (q.mode === "numbers") return `${pos === "kiri" ? "Kiri" : "Kanan"}, angka ${s.value}`;
  return `${pos === "kiri" ? "Kiri" : "Kanan"}, ${s.exprSay}`;
}

export function BandingkanPlay({ level, onFinish }: PlayProps) {
  const cfg = LEVEL_CONFIG[level.id] ?? LEVEL_CONFIG.mudah;
  const { voice } = useSettings();
  const { after, clear } = useTimers();

  const [questions] = useState(() => buildQuestions(cfg));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [picked, setPicked] = useState<Answer | null>(null);
  const [msg, setMsg] = useState("");

  const lockedRef = useRef(false);
  const scoreRef = useRef(0);
  const finishRef = useRef(onFinish);
  useEffect(() => {
    finishRef.current = onFinish;
  });

  const q = questions[idx];

  // bacakan soal setiap kali soal baru muncul
  useEffect(() => {
    const t = after(300, () => speak(q.say));
    return () => clear(t);
  }, [q, after, clear]);

  function choose(a: Answer) {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setLocked(true);
    setPicked(a);
    const ok = a === q.answer;
    if (ok) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
      sfx.good();
      setMsg(`${praise()} ${q.reveal}`);
      speak(`Benar! ${revealSpeech(q)}`);
    } else {
      sfx.bad();
      setMsg(`Hampir! ${q.reveal}`);
      speak(`Tidak apa-apa. ${revealSpeech(q)}`);
    }
    after(ok ? 2200 : 3400, () => {
      if (idx + 1 >= ROUNDS) {
        finishRef.current({ score: scoreRef.current, total: ROUNDS });
        return;
      }
      setIdx(idx + 1);
      setPicked(null);
      setMsg("");
      lockedRef.current = false;
      setLocked(false);
    });
  }

  const mark = (a: Answer) =>
    `${locked && q.answer === a ? " ok" : ""}${locked && picked === a && q.answer !== a ? " no" : ""}`;

  const sides: [Side, "left" | "right", "kiri" | "kanan"][] = [
    [q.left, "left", "kiri"],
    [q.right, "right", "kanan"],
  ];

  return (
    <>
      <RoundBar left={`Soal ${idx + 1} dari ${ROUNDS}`} score={score} />
      <div className="ask">{q.text}</div>

      <div className={`${css.sides}${locked ? ` ${css.lockd}` : ""}`}>
        {sides.map(([s, a, pos]) => (
          <button
            key={a}
            type="button"
            className={`choice ${css.side}${mark(a)}`}
            onClick={() => choose(a)}
            aria-label={sideLabel(q, s, pos)}
          >
            {q.mode === "items" && (
              <span className={css.grid} aria-hidden>
                {Array.from({ length: s.value }, (_, i) => (
                  <span key={i}>{s.item!.emoji}</span>
                ))}
              </span>
            )}
            {q.mode === "numbers" && <span className={css.num}>{s.value}</span>}
            {q.mode === "calc" && <span className={css.expr}>{s.expr}</span>}
            <span className={css.result} aria-hidden>
              {locked ? (q.mode === "calc" ? `= ${s.value}` : s.value) : " "}
              {locked && q.answer === a ? " ✓" : ""}
            </span>
          </button>
        ))}
      </div>

      {q.hasSame && (
        <button
          type="button"
          className={`btn xl${locked && q.answer === "same" ? " ok" : ""}${locked && picked === "same" && q.answer !== "same" ? ` ${css.samebad}` : ""}`}
          onClick={() => choose("same")}
          aria-label={q.sameLabel}
        >
          🟰 {q.sameLabel}
          {locked && q.answer === "same" ? " ✓" : ""}
        </button>
      )}

      <Msg>{msg}</Msg>

      <button type="button" className="btn" disabled={!voice} onClick={() => speak(locked ? revealSpeech(q) : q.say)}>
        🔊 Dengar lagi
      </button>
    </>
  );
}

