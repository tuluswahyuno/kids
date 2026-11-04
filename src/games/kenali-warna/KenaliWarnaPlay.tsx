"use client";

import { useEffect, useRef, useState } from "react";
import { beep, sfx, speak } from "@/engine/audio";
import { useSettings } from "@/engine/settings";
import { useTimers } from "@/engine/timers";
import type { PlayProps } from "@/engine/types";
import { Msg, praise, RoundBar } from "@/engine/ui";
import type { ColorDef } from "./data";
import css from "./KenaliWarna.module.css";
import { buildQuestions, cap, ROUNDS } from "./logic";

export function KenaliWarnaPlay({ level, onFinish }: PlayProps) {
  const { voice, text } = useSettings();
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

  function answer(opt: ColorDef) {
    if (lockRef.current) return;
    lockRef.current = true;
    setLocked(true);
    setPicked(opt.id);
    const ok = opt.id === q.answer.id;
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

  const textOnly = q.kind === "read";
  const alwaysName = q.kind === "object" || q.kind === "mix";

  return (
    <>
      <RoundBar left={`Soal ${idx + 1} dari ${questions.length}`} score={score} />
      <div className="stage">
        <div className={css.prompt}>{q.prompt}</div>

        {q.kind === "hear" && (
          <div className={css.hearEmoji} aria-hidden>
            👂
          </div>
        )}

        {q.kind === "read" && (
          <div
            className={css.bigSwatch}
            style={{ background: q.answer.hex }}
            role="img"
            aria-label={locked ? `Kotak warna ${q.answer.name}` : "Kotak warna yang harus ditebak"}
          />
        )}

        {q.kind === "object" && q.object && (
          <div className={css.objEmoji} role="img" aria-label={q.object.name}>
            {q.object.emoji}
          </div>
        )}

        {q.kind === "mix" && q.mix && (
          <div className={css.mix} key={idx}>
            <div className={css.mixCol}>
              <span className={`${css.ball} ${css.ballA}`} style={{ background: q.mix.a.hex }} role="img" aria-label={`Lingkaran ${q.mix.a.name}`} />
              <small>{cap(q.mix.a.name)}</small>
            </div>
            <span className={css.op} aria-hidden>
              +
            </span>
            <div className={css.mixCol}>
              <span className={`${css.ball} ${css.ballB}`} style={{ background: q.mix.b.hex }} role="img" aria-label={`Lingkaran ${q.mix.b.name}`} />
              <small>{cap(q.mix.b.name)}</small>
            </div>
            <span className={css.op} aria-hidden>
              =
            </span>
            <div className={css.mixCol}>
              {locked ? (
                <span className={css.ball} style={{ background: q.answer.hex }} role="img" aria-label={`Lingkaran ${q.answer.name}`} />
              ) : (
                <span className={`${css.ball} ${css.unknown}`} aria-label="Hasil campuran, belum diketahui" role="img">
                  ?
                </span>
              )}
              <small>{locked ? cap(q.answer.name) : "?"}</small>
            </div>
          </div>
        )}

        <button type="button" className={`btn ${css.replay}`} onClick={() => speak(q.prompt)} disabled={!voice} aria-label="Dengar lagi">
          🔊 Dengar lagi
        </button>
      </div>
      <Msg>{msg}</Msg>
      <div
        className={`choices ${css.opts}${q.options.length === 4 ? ` ${css.c4}` : ""}${locked ? " lock" : ""}`}
        style={{ ["--cols" as string]: q.options.length }}
      >
        {q.options.map((o) => {
          const state = locked ? (o.id === q.answer.id ? " ok" : o.id === picked ? " no" : "") : "";
          const showName = alwaysName || (locked && (o.id === q.answer.id || o.id === picked)) || text;
          return (
            <button
              key={o.id}
              type="button"
              className={`choice ${css.opt}${state}`}
              onClick={() => answer(o)}
              aria-label={textOnly ? cap(o.name) : `Warna ${o.name}`}
            >
              {textOnly ? (
                <span className={css.textOpt}>{cap(o.name)}</span>
              ) : (
                <>
                  <span className={css.swatch} style={{ background: o.hex }} aria-hidden />
                  <small aria-hidden>{showName ? cap(o.name) : ""}</small>
                </>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
