"use client";

import { useEffect, useRef, useState } from "react";
import { beep, sfx, speak } from "@/engine/audio";
import { updateSettings, useSettings } from "@/engine/settings";
import { useTimers } from "@/engine/timers";
import type { PlayProps } from "@/engine/types";
import { Msg, praise, RoundBar } from "@/engine/ui";
import { buildQuestions, exampleSentence, LEVEL_CONFIG, ROUNDS, type Question } from "./logic";
import css from "./KenaliHuruf.module.css";

const FONT_CLASS = [css.f0, css.f1, css.f2];

function optionLabel(q: Question, o: string) {
  return q.optionCase === "upper" ? `Huruf besar ${o}` : `Huruf kecil ${o}`;
}

export function KenaliHurufPlay({ level, onFinish }: PlayProps) {
  const cfg = LEVEL_CONFIG[level.id] ?? LEVEL_CONFIG.mudah;
  const { voice, text } = useSettings();
  const { after } = useTimers();

  const finishRef = useRef(onFinish);
  useEffect(() => {
    finishRef.current = onFinish;
  });

  const [questions] = useState(() => buildQuestions(level.id));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const q = questions[idx];
  const needsVoice = cfg.mode === "hear" || cfg.mode === "similar";

  // ucapkan perintah setiap soal baru
  useEffect(() => {
    const t = setTimeout(() => speak(q.speech), 300);
    return () => clearTimeout(t);
  }, [q]);

  function answer(o: string) {
    if (locked) return;
    setLocked(true);
    setPicked(o);
    const ok = o === q.answer;
    const nextScore = score + (ok ? 1 : 0);
    const ex = exampleSentence(q);
    if (ok) {
      setScore(nextScore);
      sfx.good();
      setMsg(`${praise()}${ex ? ` ${q.letter.upper} untuk ${q.example!.name}` : ""}`);
      after(350, () => speak(ex ? `Benar! ${ex}` : `Benar! Itu huruf ${q.letter.name}`));
    } else {
      beep(180, 0.3, "sawtooth");
      setMsg(`Hampir! Yang benar ${q.answer} 💪`);
      after(350, () => speak(`Hampir! Yang benar huruf ${q.letter.name}${ex ? `. ${ex}` : ""}`));
    }
    after(ok ? 2800 : 3800, () => {
      if (idx + 1 >= questions.length) {
        finishRef.current({ score: nextScore, total: questions.length || ROUNDS });
        return;
      }
      setIdx(idx + 1);
      setLocked(false);
      setPicked(null);
      setMsg("");
    });
  }

  if (!voice && needsVoice) {
    return (
      <div className={`panel ${css.novoice}`}>
        <div className="big-emoji" aria-hidden>
          🔇
        </div>
        <h2>Nyalakan suara untuk bermain</h2>
        <p>Tingkat ini perlu mendengarkan nama huruf. Nyalakan suara dulu ya!</p>
        <button type="button" className="btn primary xl" onClick={() => updateSettings({ voice: true })}>
          🔊 Nyalakan suara
        </button>
      </div>
    );
  }

  return (
    <>
      <RoundBar left={`Soal ${idx + 1} dari ${questions.length}`} score={score} />
      <div className="stage">
        {q.item ? (
          <>
            <div className={css.pic} role="img" aria-label={`Gambar ${q.item.name}`}>
              {q.item.emoji}
            </div>
            {text && <div className={css.word}>{q.item.name}</div>}
          </>
        ) : q.shown ? (
          <div className={css.big} aria-label={`Huruf ${q.shown}`}>
            {q.shown}
          </div>
        ) : (
          <div className={css.big} aria-hidden>
            🔊
          </div>
        )}
        <div className={css.ask}>{q.ask}</div>
        <button type="button" className={`btn ${css.replay}`} disabled={!voice} onClick={() => speak(q.speech)} aria-label="Dengar lagi">
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
              className={`choice ${css.opt} ${FONT_CLASS[q.fontIdx] ?? css.f0}${state}`}
              onClick={() => answer(o)}
              aria-label={optionLabel(q, o)}
            >
              {o}
            </button>
          );
        })}
      </div>
    </>
  );
}
