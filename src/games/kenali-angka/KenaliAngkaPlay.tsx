"use client";

import { useEffect, useRef, useState } from "react";
import { beep, sfx, speak } from "@/engine/audio";
import { useSettings } from "@/engine/settings";
import { useTimers } from "@/engine/timers";
import type { PlayProps } from "@/engine/types";
import { Msg, praise, RoundBar } from "@/engine/ui";
import { numberWord } from "@/content/items";
import { buildQuestions, LEVEL_CONFIG, ROUNDS, type ChoiceQuestion, type OrderQuestion } from "./logic";
import css from "./KenaliAngka.module.css";

export function KenaliAngkaPlay({ level, onFinish }: PlayProps) {
  const cfg = LEVEL_CONFIG[level.id] ?? LEVEL_CONFIG.mudah;
  const { voice } = useSettings();
  const { after, clear } = useTimers();

  const [questions] = useState(() => buildQuestions(cfg));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
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

  /** Dipanggil papan soal saat jawaban final. Mengembalikan false bila sudah terkunci. */
  function resolve(ok: boolean): boolean {
    if (lockedRef.current) return false;
    lockedRef.current = true;
    setLocked(true);
    if (ok) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
      sfx.good();
      const p = praise();
      setMsg(`${p} ${q.reveal}`);
      speak(`Benar! ${q.reveal}`);
    } else {
      sfx.bad();
      setMsg(`Hampir! ${q.reveal}`);
      speak(`Tidak apa-apa. ${q.reveal}`);
    }
    after(ok ? 1900 : 3000, () => {
      if (idx + 1 >= ROUNDS) {
        finishRef.current({ score: scoreRef.current, total: ROUNDS });
        return;
      }
      setIdx(idx + 1);
      setMsg("");
      lockedRef.current = false;
      setLocked(false);
    });
    return true;
  }

  return (
    <>
      <RoundBar left={`Soal ${idx + 1} dari ${ROUNDS}`} score={score} />
      <div className="ask">{q.text}</div>

      {q.type === "choice" ? (
        <ChoiceBoard key={idx} q={q} locked={locked} resolve={resolve} />
      ) : (
        <OrderBoard key={idx} q={q} locked={locked} resolve={resolve} setMsg={setMsg} />
      )}

      <Msg>{msg}</Msg>

      <button type="button" className="btn" disabled={!voice} onClick={() => speak(q.say)}>
        🔊 Dengar lagi
      </button>
    </>
  );
}

/* ---------------------------------------------------------------- pilihan */

function ChoiceBoard({ q, locked, resolve }: { q: ChoiceQuestion; locked: boolean; resolve: (ok: boolean) => boolean }) {
  const [picked, setPicked] = useState<number | null>(null);

  function choose(v: number) {
    if (resolve(v === q.answer)) setPicked(v);
  }

  const slot = (v: number | null, key: string) => (
    <span key={key} className={`${css.tile} ${v === null ? css.hole : ""}`} aria-label={v === null ? "angka yang hilang" : `angka ${v}`}>
      {v === null ? (locked ? q.answer : "?") : v}
    </span>
  );

  return (
    <>
      <div className={`stage ${css.board}`}>
        {q.kind === "word" && <span className={css.word}>{q.word}</span>}
        {q.kind === "dots" && <span className={css.bignum}>{q.answer}</span>}
        {q.kind === "next" && (
          <div className={css.seq}>
            {slot(q.ref!, "r")}
            <span className={css.arrow} aria-hidden>→</span>
            {slot(null, "h")}
          </div>
        )}
        {q.kind === "prev" && (
          <div className={css.seq}>
            {slot(null, "h")}
            <span className={css.arrow} aria-hidden>→</span>
            {slot(q.ref!, "r")}
          </div>
        )}
        {q.kind === "missing" && <div className={css.seq}>{q.seq!.map((v, i) => slot(v, String(i)))}</div>}
      </div>

      {q.kind === "dots" ? (
        <div className={`${css.groups}${locked ? ` ${css.lockd}` : ""}`} role="group" aria-label="Pilihan kelompok">
          {q.options.map((v, i) => (
            <button
              key={v}
              type="button"
              className={`choice ${css.group}${locked && v === q.answer ? " ok" : ""}${locked && picked === v && v !== q.answer ? " no" : ""}`}
              onClick={() => choose(v)}
              aria-label={`Kelompok ${String.fromCharCode(65 + i)}`}
            >
              <span className={css.dots} aria-hidden>
                {Array.from({ length: v }, (_, k) => (
                  <span key={k}>{q.emoji}</span>
                ))}
              </span>
              {locked && v === q.answer && <span className={css.check} aria-hidden>✓ {v}</span>}
            </button>
          ))}
        </div>
      ) : (
        <div className={`choices${locked ? " lock" : ""}`} style={{ ["--cols" as string]: q.options.length }}>
          {q.options.map((v) => (
            <button
              key={v}
              type="button"
              className={`choice${locked && v === q.answer ? " ok" : ""}${locked && picked === v && v !== q.answer ? " no" : ""}`}
              onClick={() => choose(v)}
              aria-label={`Angka ${v}`}
            >
              {v}
              {locked && v === q.answer && <small aria-hidden>✓</small>}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

/* ----------------------------------------------------------------- urutan */

function OrderBoard({
  q,
  locked,
  resolve,
  setMsg,
}: {
  q: OrderQuestion;
  locked: boolean;
  resolve: (ok: boolean) => boolean;
  setMsg: (m: string) => void;
}) {
  const { after } = useTimers();
  const [placed, setPlaced] = useState<number[]>([]);
  const [shake, setShake] = useState<number | null>(null);
  const mistakes = useRef(0);

  function tap(v: number) {
    if (locked || placed.includes(v)) return;
    const want = q.sorted[placed.length];
    if (v === want) {
      const next = [...placed, v];
      setPlaced(next);
      setMsg("");
      beep(380 + next.length * 60, 0.12);
      speak(numberWord(v));
      if (next.length === q.sorted.length) resolve(mistakes.current === 0);
    } else {
      mistakes.current += 1;
      setShake(v);
      after(450, () => setShake(null));
      beep(200, 0.15, "triangle");
      setMsg(q.dir === "asc" ? "Coba lagi ya! Cari yang paling kecil dulu." : "Coba lagi ya! Cari yang paling besar dulu.");
    }
  }

  return (
    <div className={`stage ${css.board}`}>
      <div className={css.hint}>{q.dir === "asc" ? "⬆️ Kecil → Besar" : "⬇️ Besar → Kecil"}</div>
      <div className={css.pool}>
        {q.numbers.map((v) => {
          const used = placed.includes(v);
          return (
            <button
              key={v}
              type="button"
              className={`choice ${css.num}${shake === v ? ` ${css.shake}` : ""}${used ? ` ${css.used}` : ""}`}
              disabled={used}
              onClick={() => tap(v)}
              aria-label={`Angka ${v}`}
            >
              {v}
            </button>
          );
        })}
      </div>
      <div className={css.slots} aria-label="Urutan jawabanmu">
        {q.sorted.map((_, i) => (
          <span key={i} className={`${css.slot}${placed[i] !== undefined ? ` ${css.filled}` : ""}`}>
            {placed[i] ?? ""}
          </span>
        ))}
      </div>
    </div>
  );
}
