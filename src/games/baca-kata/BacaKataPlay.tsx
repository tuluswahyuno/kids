"use client";

import { useEffect, useRef, useState } from "react";
import { hyphenated } from "@/content/baca-kata";
import type { ContentItem } from "@/content/items";
import { beep, sfx, speak } from "@/engine/audio";
import { useSettings } from "@/engine/settings";
import { useTimers } from "@/engine/timers";
import type { PlayProps } from "@/engine/types";
import { Msg, praise, RoundBar, TimerBar } from "@/engine/ui";
import { buildQuestions, LEVEL_CONFIG, ROUNDS } from "./logic";
import css from "./BacaKata.module.css";

const INSTRUCTION = "Baca kata ini. Pilih gambar yang cocok.";

export function BacaKataPlay({ level, category, onFinish }: PlayProps) {
  const cfg = LEVEL_CONFIG[level.id] ?? LEVEL_CONFIG.mudah;
  const { voice } = useSettings();
  const { after, every, clear } = useTimers();

  const [questions] = useState(() => buildQuestions(category, cfg));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [frac, setFrac] = useState(1);

  const lockedRef = useRef(false);
  const resolveRef = useRef<(opt: ContentItem | null) => void>(() => {});

  // onFinish berganti identitas tiap render -> simpan di ref
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  });

  const q = questions[idx];
  const name = q.answer.name;

  // ucapkan perintah di setiap soal baru
  useEffect(() => {
    const t = after(300, () => speak(INSTRUCTION));
    return () => clear(t);
  }, [idx, after, clear]);

  // batas waktu per soal (tingkat "Cepat Baca")
  useEffect(() => {
    if (!cfg.time) return;
    const t0 = performance.now();
    const id = every(250, () => {
      if (lockedRef.current) return;
      const left = cfg.time - (performance.now() - t0) / 1000;
      setFrac(left / cfg.time);
      if (left <= 0) resolveRef.current(null);
    });
    return () => clear(id);
  }, [idx, cfg.time, every, clear]);

  function resolve(opt: ContentItem | null) {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setLocked(true);
    setPicked(opt?.id ?? null);
    const ok = opt?.id === q.answer.id;
    const nextScore = score + (ok ? 1 : 0);
    if (ok) {
      setScore(nextScore);
      sfx.good();
      setMsg(praise());
      after(350, () => speak(name));
    } else {
      beep(180, 0.3, "sawtooth");
      setMsg(`${opt ? "Hampir!" : "Waktu habis!"} Kata ini: ${name} ${q.answer.emoji}`);
      after(350, () => speak(`Kata ini ${name}`));
    }
    after(ok ? 2000 : 3000, () => {
      if (idx + 1 >= questions.length) {
        onFinishRef.current({ score: nextScore, total: questions.length || ROUNDS });
        return;
      }
      lockedRef.current = false;
      setIdx(idx + 1);
      setLocked(false);
      setPicked(null);
      setMsg("");
      setFrac(1);
    });
  }

  useEffect(() => {
    resolveRef.current = resolve;
  });

  const cols = cfg.options === 4 ? 2 : 3;
  const canHearWord = cfg.syllables || locked;

  return (
    <>
      <RoundBar left={`Kata ${idx + 1} dari ${questions.length}`} score={score} />
      {cfg.time > 0 && <TimerBar fraction={frac} warn={frac < 0.35} hidden={locked} />}
      <div className="stage">
        <button
          type="button"
          className={css.word}
          onClick={() => speak(name.toLowerCase())}
          disabled={!canHearWord || !voice}
          aria-label={`Kata ${name}. Ketuk untuk mendengar`}
        >
          {cfg.syllables ? hyphenated(name) : name}
        </button>
        <div className={css.hint}>{cfg.syllables && voice ? "Ketuk kata untuk mendengarnya 👆" : "Baca kata ini. Pilih gambarnya."}</div>
        <button type="button" className="btn" disabled={!voice} onClick={() => speak(INSTRUCTION)} aria-label="Dengar perintah lagi">
          🔊 Dengar lagi
        </button>
      </div>
      <Msg>{msg}</Msg>
      <div className={`choices${locked ? " lock" : ""}`} style={{ ["--cols" as string]: cols }}>
        {q.options.map((o) => {
          const state = locked ? (o.id === q.answer.id ? " ok" : o.id === picked ? " no" : "") : "";
          return (
            <button key={o.id} type="button" className={`choice${state}`} onClick={() => resolve(o)} aria-label={`Gambar ${o.name}`}>
              {o.emoji}
            </button>
          );
        })}
      </div>
    </>
  );
}
