"use client";

import { useEffect, useState } from "react";
import { beep, sfx, speak } from "@/engine/audio";
import { updateSettings, useSettings } from "@/engine/settings";
import { useTimers } from "@/engine/timers";
import type { PlayProps } from "@/engine/types";
import { Msg, praise, RoundBar } from "@/engine/ui";
import type { ContentItem } from "@/content/items";
import { buildQuestions, LEVEL_CONFIG, ROUNDS, type LevelConfig } from "./logic";
import css from "./TebakSuara.module.css";

function playClue(answer: ContentItem, cfg: LevelConfig) {
  const a = answer.animal!;
  if (cfg.mode === "sound") {
    speak("Suara apa ini?", { rate: 0.85 });
    speak(a.sound, { pitch: a.pitch, rate: 0.9, queue: true, clip: answer.audio?.sound });
  } else {
    speak(`${a.clue} Siapa aku?`);
  }
}

export function TebakSuaraPlay({ level, onFinish }: PlayProps) {
  const cfg = LEVEL_CONFIG[level.id] ?? LEVEL_CONFIG.mudah;
  const { voice } = useSettings();
  const { after } = useTimers();

  const [questions] = useState(() => buildQuestions(cfg));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [waving, setWaving] = useState(false);

  const q = questions[idx];
  const a = q.answer.animal!;

  function wave() {
    setWaving(true);
    after(2500, () => setWaving(false));
  }

  // putar bunyi/teka-teki di setiap soal baru (hanya bila suara menyala)
  useEffect(() => {
    if (!voice) return;
    const t = setTimeout(() => {
      playClue(q.answer, cfg);
      setWaving(true);
    }, 350);
    const w = setTimeout(() => setWaving(false), 2850);
    return () => {
      clearTimeout(t);
      clearTimeout(w);
    };
  }, [idx, voice, q.answer, cfg]);

  function replay() {
    playClue(q.answer, cfg);
    wave();
  }

  function answer(opt: ContentItem) {
    if (locked) return;
    setLocked(true);
    setPicked(opt.id);
    const ok = opt.id === q.answer.id;
    const nextScore = score + (ok ? 1 : 0);
    if (ok) {
      setScore(nextScore);
      sfx.good();
      setMsg(praise());
      after(350, () => speak(`Benar! ${q.answer.name} bilang ${a.soundText}`));
    } else {
      beep(180, 0.3, "sawtooth");
      setMsg(`Hampir! Itu ${q.answer.name}`);
      after(350, () => speak(`Itu ${q.answer.name}. ${q.answer.name} bilang ${a.soundText}`));
    }
    after(ok ? 2800 : 3600, () => {
      if (idx + 1 >= questions.length) {
        onFinish({ score: nextScore, total: questions.length || ROUNDS });
        return;
      }
      setIdx(idx + 1);
      setLocked(false);
      setPicked(null);
      setMsg("");
    });
  }

  if (!voice) {
    return (
      <div className={`panel ${css.novoice}`}>
        <div className="big-emoji" aria-hidden>
          🔇
        </div>
        <h2>Nyalakan suara untuk bermain</h2>
        <p>Game ini perlu didengarkan. Nyalakan suara dulu ya!</p>
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
        <div className={`${css.mystery} ${waving ? css.wave : ""}`} role="img" aria-label={locked ? q.answer.name : "Hewan misterius"}>
          {locked ? q.answer.emoji : "❓"}
        </div>
        {cfg.mode === "clue" ? (
          <div className={css.clue}>
            {a.clue}
            <br />
            Siapa aku?
          </div>
        ) : cfg.showSoundText ? (
          <div className={css.soundText}>“{a.soundText}”</div>
        ) : (
          <div className={css.clue}>Dengarkan baik-baik 👂</div>
        )}
        <button type="button" className={`btn ${css.replay}`} onClick={replay} aria-label="Dengar lagi">
          🔊 Dengar lagi
        </button>
      </div>
      <Msg>{msg}</Msg>
      <div className={`choices${locked ? " lock" : ""}`} style={{ ["--cols" as string]: cfg.options === 4 ? 2 : 3 }}>
        {q.options.map((o) => {
          const state = locked ? (o.id === q.answer.id ? " ok" : o.id === picked ? " no" : "") : "";
          return (
            <button
              key={o.id}
              type="button"
              className={`choice${state}`}
              onClick={() => answer(o)}
              aria-label={cfg.showNames ? o.name : "Pilihan hewan"}
            >
              {o.emoji}
              {cfg.showNames && <small>{o.name}</small>}
            </button>
          );
        })}
      </div>
    </>
  );
}
