"use client";

import { useEffect, useRef, useState } from "react";
import { beep, sfx, speak } from "@/engine/audio";
import { updateSettings, useSettings } from "@/engine/settings";
import { useTimers } from "@/engine/timers";
import type { PlayProps } from "@/engine/types";
import { Msg, praise, RoundBar } from "@/engine/ui";
import { buildQuestions, ROUNDS, spokenWord, type BuildQuestion, type HearQuestion, type Tile } from "./logic";
import css from "./SukuKata.module.css";

const COLORS = [css.c0, css.c1, css.c2, css.c3];
const colorOf = (i: number) => COLORS[i % COLORS.length];

export function SukuKataPlay({ level, onFinish }: PlayProps) {
  const { voice } = useSettings();
  const { after } = useTimers();

  const finishRef = useRef(onFinish);
  useEffect(() => {
    finishRef.current = onFinish;
  });

  const [questions] = useState(() => buildQuestions(level.id));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [msg, setMsg] = useState("");
  // mode "hear"
  const [picked, setPicked] = useState<string | null>(null);
  // mode "build"
  const [pos, setPos] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [used, setUsed] = useState<Set<number>>(new Set());
  const [shakeId, setShakeId] = useState<number | null>(null);

  const q = questions[idx];

  // ucapkan perintah setiap soal baru
  useEffect(() => {
    const t = setTimeout(() => {
      if (q.kind === "hear") speak(q.answer, { rate: 0.8 });
      else speak("Susun suku kata untuk gambar ini");
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  function next(nextScore: number) {
    const n = idx + 1;
    if (n >= questions.length) {
      finishRef.current({ score: nextScore, total: questions.length || ROUNDS });
      return;
    }
    setIdx(n);
    setLocked(false);
    setMsg("");
    setPicked(null);
    setPos(0);
    setMistakes(0);
    setUsed(new Set());
    setShakeId(null);
  }

  function answerHear(qh: HearQuestion, o: string) {
    if (locked) return;
    setLocked(true);
    setPicked(o);
    const ok = o === qh.answer;
    const nextScore = score + (ok ? 1 : 0);
    if (ok) {
      setScore(nextScore);
      sfx.good();
      setMsg(praise());
      after(350, () => speak(`Benar! ${qh.answer}`, { rate: 0.8 }));
    } else {
      beep(180, 0.3, "sawtooth");
      setMsg(`Hampir! Yang benar “${qh.answer}” 💪`);
      after(350, () => speak(`Hampir! Yang benar ${qh.answer}`, { rate: 0.8 }));
    }
    after(ok ? 2400 : 3400, () => next(nextScore));
  }

  function onTile(qb: BuildQuestion, t: Tile) {
    if (locked || used.has(t.id)) return;
    if (t.text === qb.word.syllables[pos]) {
      sfx.tap();
      speak(t.text, { rate: 0.8 });
      setUsed((u) => new Set(u).add(t.id));
      const np = pos + 1;
      setPos(np);
      if (np === qb.word.syllables.length) {
        setLocked(true);
        const perfect = mistakes === 0;
        const nextScore = score + (perfect ? 1 : 0);
        setScore(nextScore);
        setMsg(`${perfect ? praise() : "Bagus! 👏"} ${qb.word.word}`);
        sfx.win();
        after(700, () => speak(spokenWord(qb.word), { rate: 0.85 }));
        after(3400 + qb.word.syllables.length * 500, () => next(nextScore));
      }
    } else {
      setMistakes((m) => m + 1);
      beep(180, 0.25, "sawtooth");
      setShakeId(null);
      after(0, () => setShakeId(t.id));
      after(400, () => setShakeId(null));
      setMsg("Ups, coba lagi 🤔");
      speak("Coba lagi");
    }
  }

  function skip() {
    if (locked) return;
    setLocked(true);
    next(score);
  }

  const header = <RoundBar left={`Soal ${idx + 1} dari ${questions.length}`} score={score} />;

  if (q.kind === "hear") {
    if (!voice) {
      return (
        <div className={`panel ${css.novoice}`}>
          <div className="big-emoji" aria-hidden>
            🔇
          </div>
          <h2>Nyalakan suara untuk bermain</h2>
          <p>Tingkat ini perlu mendengarkan suku kata. Nyalakan suara dulu ya!</p>
          <button type="button" className="btn primary xl" onClick={() => updateSettings({ voice: true })}>
            🔊 Nyalakan suara
          </button>
        </div>
      );
    }
    return (
      <>
        {header}
        <div className="stage">
          <div className={css.big} aria-hidden>
            🔊
          </div>
          <div className={css.ask}>Dengarkan, lalu pilih suku katanya</div>
          <button type="button" className={`btn ${css.replay}`} onClick={() => speak(q.answer, { rate: 0.8 })} aria-label="Dengar lagi">
            🔊 Dengar lagi
          </button>
        </div>
        <Msg>{msg}</Msg>
        <div className={`choices${locked ? " lock" : ""}`} style={{ ["--cols" as string]: 2 }}>
          {q.options.map((o) => {
            const state = locked ? (o === q.answer ? " ok" : o === picked ? " no" : "") : "";
            return (
              <button
                key={o}
                type="button"
                className={`choice ${css.opt}${state}`}
                onClick={() => answerHear(q, o)}
                aria-label={`Suku kata ${o}`}
              >
                {o}
              </button>
            );
          })}
        </div>
      </>
    );
  }

  // mode susun kata
  const syl = q.word.syllables;
  const done = pos === syl.length;
  const hintText = mistakes >= 2 && !done ? syl[pos] : null;
  const hintId = hintText ? q.tiles.find((t) => !used.has(t.id) && t.text === hintText)?.id : undefined;

  return (
    <>
      {header}
      <div className="stage">
        <div className={css.pic} role="img" aria-label={`Gambar ${q.word.word}`}>
          {q.word.emoji}
        </div>
        <div className={css.slots} aria-label={`Kata dengan ${syl.length} suku kata`}>
          {syl.map((s, i) =>
            i < pos ? (
              <div key={i} className={`${css.slot} ${css.fill} ${colorOf(i)}`}>
                {s}
              </div>
            ) : (
              <div key={i} className={`${css.slot} ${i === pos ? css.next : ""}`} aria-hidden>
                ?
              </div>
            ),
          )}
        </div>
        {done && (
          <div className={css.whole} aria-label={`${syl.join(" ")}, ${q.word.word}`}>
            {syl.map((s, i) => (
              <span key={i} className={colorOf(i)}>
                {s}
                {i < syl.length - 1 ? <b aria-hidden>-</b> : null}
              </span>
            ))}
          </div>
        )}
      </div>
      <Msg>{msg}</Msg>
      <div className={css.tray}>
        {q.tiles.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`${css.tile} ${used.has(t.id) ? css.used : ""} ${shakeId === t.id ? css.shake : ""} ${hintId === t.id ? css.hint : ""}`}
            onClick={() => onTile(q, t)}
            aria-label={`Suku kata ${t.text}`}
            disabled={used.has(t.id)}
          >
            {t.text}
          </button>
        ))}
      </div>
      <div className="row">
        <button type="button" className="btn" disabled={!voice} onClick={() => speak(q.word.word)}>
          🔊 Dengar kata
        </button>
        <button type="button" className="btn" onClick={skip}>
          ⏭ Lewati
        </button>
      </div>
    </>
  );
}
