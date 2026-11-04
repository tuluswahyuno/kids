"use client";

import { useEffect, useRef, useState } from "react";
import { beep, sfx, speak } from "@/engine/audio";
import { useSettings } from "@/engine/settings";
import { useTimers } from "@/engine/timers";
import type { PlayProps } from "@/engine/types";
import { Msg, praise, RoundBar } from "@/engine/ui";
import css from "./BentukPola.module.css";
import { Shape } from "./Shape";
import { buildQuestions, ROUNDS, tokenLabel, type Question } from "./logic";

function sequenceLabel(q: Question, filled: boolean): string {
  const parts = (q.sequence ?? []).map((t) => (t ? tokenLabel(t) : filled ? "jawaban" : "tanda tanya"));
  return `Pola: ${parts.join(", ")}`;
}

export function BentukPolaPlay({ level, onFinish }: PlayProps) {
  const { voice } = useSettings();
  const { after, clear } = useTimers();

  const [questions] = useState(() => buildQuestions(level.id));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const lockRef = useRef(false);

  // onFinish berganti identitas tiap render: simpan di ref agar timer tidak ter-reset
  const finishRef = useRef(onFinish);
  useEffect(() => {
    finishRef.current = onFinish;
  });

  const q = questions[idx];

  // ucapkan soal baru (hanya bila suara menyala)
  useEffect(() => {
    if (!voice) return;
    const id = after(350, () => speak(q.prompt));
    return () => clear(id);
  }, [idx, voice, q.prompt, after, clear]);

  function answer(optId: string) {
    if (lockRef.current) return;
    lockRef.current = true;
    setLocked(true);
    setPicked(optId);
    const ok = optId === q.answerId;
    const nextScore = score + (ok ? 1 : 0);
    if (ok) {
      setScore(nextScore);
      sfx.good();
      setMsg(praise());
      after(350, () => speak(`Benar! ${q.explain}`));
    } else {
      beep(330, 0.18, "sine");
      setMsg(`Hampir! ${q.explain}`);
      after(350, () => speak(`Tidak apa-apa. ${q.explain}. Ayo coba yang berikutnya!`));
    }
    after(ok ? 2400 : 3800, () => {
      if (idx + 1 >= questions.length) {
        finishRef.current({ score: nextScore, total: questions.length || ROUNDS });
        return;
      }
      setIdx(idx + 1);
      setLocked(false);
      setPicked(null);
      setMsg("");
      lockRef.current = false;
    });
  }

  const answerOpt = q.options.find((o) => o.id === q.answerId);
  const cols = q.kind === "pattern" ? 4 : 3;
  const optsClass = `${css.opts} ${q.kind === "name" ? css.col1m : ""} ${q.kind === "pattern" ? css.c4 : ""}`;

  return (
    <>
      <RoundBar left={`Soal ${idx + 1} dari ${questions.length}`} score={score} />
      <div className="stage">
        <div className={css.prompt}>{q.prompt}</div>

        {q.target && (
          <div className={css.target}>
            <Shape
              shape={q.target.shape}
              color={q.target.color}
              size={q.kind === "name" ? 150 : 120}
              label={q.kind === "name" || q.kind === "object" || q.kind === "same" ? "Bentuk yang harus dikenali" : undefined}
            />
          </div>
        )}

        {q.sequence && (
          <div className={css.seq} role="img" aria-label={sequenceLabel(q, locked)}>
            {q.sequence.map((t, i) =>
              t ? (
                <Shape key={i} shape={t.shape} color={t.color} fill={t.fill} size={44} />
              ) : locked && answerOpt?.token ? (
                <Shape
                  key={i}
                  shape={answerOpt.token.shape}
                  color={answerOpt.token.color}
                  fill={answerOpt.token.fill}
                  size={44}
                />
              ) : (
                <div key={i} className={css.qcell} aria-hidden>
                  ?
                </div>
              ),
            )}
          </div>
        )}

        <button type="button" className={`btn ${css.replay}`} onClick={() => speak(q.prompt)} disabled={!voice} aria-label="Dengar lagi">
          🔊 Dengar lagi
        </button>
      </div>
      <Msg>{msg}</Msg>
      <div className={`choices${locked ? " lock" : ""} ${optsClass}`} style={{ ["--cols" as string]: cols }}>
        {q.options.map((o) => {
          const state = locked ? (o.id === q.answerId ? " ok" : o.id === picked ? " no" : "") : "";
          return (
            <button key={o.id} type="button" className={`choice ${css.opt}${state}`} onClick={() => answer(o.id)} aria-label={o.label}>
              {o.emoji && (
                <span className={css.emoji} aria-hidden>
                  {o.emoji}
                </span>
              )}
              {o.token && (
                <span className={css.shapeBox} aria-hidden>
                  <Shape shape={o.token.shape} color={o.token.color} fill={o.token.fill} size={Math.round((q.kind === "pattern" ? 64 : 84) * (o.scale ?? 1))} />
                </span>
              )}
              {o.text && (o.emoji ? <small>{o.text}</small> : <span>{o.text}</span>)}
            </button>
          );
        })}
      </div>
    </>
  );
}
