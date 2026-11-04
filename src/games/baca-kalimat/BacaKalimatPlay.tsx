"use client";

import { useEffect, useRef, useState } from "react";
import type { Sentence } from "@/content/kalimat";
import { beep, sfx, speak } from "@/engine/audio";
import { useSettings } from "@/engine/settings";
import { useTimers } from "@/engine/timers";
import type { PlayProps } from "@/engine/types";
import { Msg, praise, RoundBar } from "@/engine/ui";
import { buildQuestions, LEVEL_CONFIG, ROUNDS, type Mode, type Tile } from "./logic";
import css from "./BacaKalimat.module.css";

const INSTRUCTION: Record<Mode, string> = {
  pick: "Baca kalimat ini. Pilih gambar yang cocok.",
  fill: "Lengkapi kalimatnya. Pilih kata yang tepat.",
  arrange: "Susun kata-kata menjadi kalimat. Ketuk kata dari awal kalimat.",
};

export function BacaKalimatPlay({ level, onFinish }: PlayProps) {
  const cfg = LEVEL_CONFIG[level.id] ?? LEVEL_CONFIG.mudah;
  const { voice } = useSettings();
  const { after, clear } = useTimers();

  const [questions] = useState(() => buildQuestions(cfg));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  // mode susun
  const [placed, setPlaced] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [shakeId, setShakeId] = useState<number | null>(null);

  const lockedRef = useRef(false);
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  });

  const q = questions[idx];
  const sentence = q.sentence;
  const mode = q.mode;

  useEffect(() => {
    const t = after(300, () => speak(INSTRUCTION[mode]));
    return () => clear(t);
  }, [idx, mode, after, clear]);

  /** Akhiri soal: umpan balik, ucapkan kalimat utuh, lalu lanjut. */
  function finish(ok: boolean, wrongText?: string) {
    lockedRef.current = true;
    setLocked(true);
    const nextScore = score + (ok ? 1 : 0);
    if (ok) {
      setScore(nextScore);
      sfx.good();
      setMsg(praise());
    } else {
      beep(180, 0.3, "sawtooth");
      setMsg(wrongText ?? "Hampir! Ayo kita baca bersama 💪");
    }
    after(350, () => speak(sentence.text));
    after(ok ? 2600 : 3600, () => {
      if (idx + 1 >= questions.length) {
        onFinishRef.current({ score: nextScore, total: questions.length || ROUNDS });
        return;
      }
      lockedRef.current = false;
      setIdx(idx + 1);
      setLocked(false);
      setPicked(null);
      setMsg("");
      setPlaced([]);
      setMistakes(0);
      setShakeId(null);
    });
  }

  function onPickScene(s: Sentence) {
    if (lockedRef.current) return;
    setPicked(s.id);
    finish(s.id === sentence.id, `Hampir! Gambar yang cocok: ${sentence.scene}`);
  }

  function onPickWord(w: string) {
    if (lockedRef.current) return;
    setPicked(w);
    finish(w === sentence.words[q.blankIndex], `Hampir! Katanya: ${sentence.words[q.blankIndex]}`);
  }

  function onTile(t: Tile) {
    if (lockedRef.current || placed.includes(t.id)) return;
    const expected = sentence.words[placed.length];
    if (t.word === expected) {
      sfx.tap();
      speak(t.word);
      const next = [...placed, t.id];
      setPlaced(next);
      if (next.length === sentence.words.length) finish(mistakes === 0, "Bagus! Kamu berhasil menyusunnya 👏");
    } else {
      setMistakes((m) => m + 1);
      beep(180, 0.25, "sawtooth");
      setShakeId(t.id);
      after(400, () => setShakeId(null));
      setMsg("Ups, coba kata lain 🤔");
    }
  }

  const cols = cfg.options === 4 ? 2 : 3;
  const wordOf = (id: number) => q.tiles.find((t) => t.id === id)?.word ?? "";
  const hintId =
    mode === "arrange" && mistakes >= 2 && !locked
      ? q.tiles.find((t) => !placed.includes(t.id) && t.word === sentence.words[placed.length])?.id
      : undefined;

  return (
    <>
      <RoundBar left={`Soal ${idx + 1} dari ${questions.length}`} score={score} />
      <div className="stage">
        {mode !== "pick" && (
          <div className={css.scene} role="img" aria-label="Gambar adegan">
            {sentence.scene}
          </div>
        )}

        {mode === "pick" && (
          <button
            type="button"
            className={css.sentence}
            onClick={() => speak(sentence.text)}
            disabled={!voice}
            aria-label={`Kalimat: ${sentence.text}. Ketuk untuk mendengar`}
          >
            {sentence.words.map((w, i) => (
              <span key={i}>{w}</span>
            ))}
          </button>
        )}

        {mode === "fill" && (
          <button
            type="button"
            className={css.sentence}
            onClick={() =>
              speak(sentence.words.map((w, i) => (i === q.blankIndex && !locked ? "hmm" : w)).join(" "))
            }
            disabled={!voice}
            aria-label="Kalimat dengan satu kata hilang. Ketuk untuk mendengar"
          >
            {sentence.words.map((w, i) =>
              i === q.blankIndex ? (
                <span key={i} className={`${css.blank} ${locked ? css.filled : ""}`}>
                  {locked ? w : " "}
                </span>
              ) : (
                <span key={i}>{w}</span>
              ),
            )}
          </button>
        )}

        {mode === "arrange" && (
          <div className={css.slots} aria-label="Kalimat yang kamu susun">
            {sentence.words.map((_, i) =>
              i < placed.length ? (
                <span key={i} className={css.slot}>
                  {wordOf(placed[i])}
                </span>
              ) : (
                <span key={i} className={css.slot} aria-hidden>
                  {" "}
                </span>
              ),
            )}
          </div>
        )}

        <div className={css.hint}>{mode === "pick" && voice ? "Ketuk kalimat untuk mendengarnya 👆" : INSTRUCTION[mode].split(". ")[0] + "."}</div>
        <button type="button" className="btn" disabled={!voice} onClick={() => speak(INSTRUCTION[mode])} aria-label="Dengar perintah lagi">
          🔊 Dengar lagi
        </button>
      </div>

      <Msg>{msg}</Msg>

      {mode === "pick" && (
        <div className={`choices${locked ? " lock" : ""}`} style={{ ["--cols" as string]: cols }}>
          {q.options.map((o) => {
            const state = locked ? (o.id === sentence.id ? " ok" : o.id === picked ? " no" : "") : "";
            return (
              <button key={o.id} type="button" className={`choice${state}`} onClick={() => onPickScene(o)} aria-label={`Gambar: ${o.scene}`}>
                {o.scene}
              </button>
            );
          })}
        </div>
      )}

      {mode === "fill" && (
        <div className={`${css.words}${locked ? ` ${css.lock}` : ""}`} style={{ ["--cols" as string]: 3 }}>
          {q.fillOptions.map((w) => {
            const state = locked ? (w === sentence.words[q.blankIndex] ? ` ${css.ok}` : w === picked ? ` ${css.no}` : "") : "";
            return (
              <button key={w} type="button" className={`${css.word}${state}`} onClick={() => onPickWord(w)} aria-label={`Kata ${w}`}>
                {w}
              </button>
            );
          })}
        </div>
      )}

      {mode === "arrange" && (
        <div className={css.tray}>
          {q.tiles.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`${css.tile} ${placed.includes(t.id) ? css.used : ""} ${shakeId === t.id ? css.shake : ""} ${hintId === t.id ? css.tip : ""}`}
              onClick={() => onTile(t)}
              aria-label={`Kata ${t.word}`}
              disabled={placed.includes(t.id) || locked}
            >
              {t.word}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
