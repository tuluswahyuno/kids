"use client";

import { useEffect, useState } from "react";
import { beep, sfx, speak } from "@/engine/audio";
import { useSettings } from "@/engine/settings";
import { useTimers } from "@/engine/timers";
import type { PlayProps } from "@/engine/types";
import { Msg, RoundBar } from "@/engine/ui";
import { buildTray, LEVEL_CONFIG, pickWords, ROUNDS, type Tile } from "./logic";
import css from "./SusunHuruf.module.css";

export function SusunHurufPlay({ level, category, onFinish }: PlayProps) {
  const cfg = LEVEL_CONFIG[level.id] ?? LEVEL_CONFIG.mudah;
  const { after } = useTimers();
  const { voice } = useSettings();

  const [words] = useState(() => pickWords(category, cfg));
  const [idx, setIdx] = useState(0);
  const [pos, setPos] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [msg, setMsg] = useState("");
  const [used, setUsed] = useState<Set<number>>(new Set());
  const [shakeId, setShakeId] = useState<number | null>(null);
  const [tray, setTray] = useState<Tile[]>(() => buildTray(words[0].text, cfg.extra));

  const word = words[idx];

  // ucapkan perintah setiap kata baru
  useEffect(() => {
    const t = setTimeout(() => speak("Susun huruf untuk gambar ini"), 200);
    return () => clearTimeout(t);
  }, [idx]);

  function advance(nextScore: number) {
    const next = idx + 1;
    if (next >= words.length) {
      onFinish({ score: nextScore, total: words.length || ROUNDS });
      return;
    }
    setIdx(next);
    setPos(0);
    setMistakes(0);
    setLocked(false);
    setMsg("");
    setUsed(new Set());
    setTray(buildTray(words[next].text, cfg.extra));
  }

  function onTile(t: Tile) {
    if (locked || used.has(t.id)) return;
    if (t.ch === word.text[pos]) {
      sfx.tap();
      speak(t.ch);
      setUsed((u) => new Set(u).add(t.id));
      const np = pos + 1;
      setPos(np);
      if (np === word.text.length) {
        setLocked(true);
        const perfect = mistakes === 0;
        const nextScore = score + (perfect ? 1 : 0);
        setScore(nextScore);
        setMsg(`${perfect ? "Hebat!" : "Bagus!"} ${word.text} ${perfect ? "🎉" : "👏"}`);
        sfx.win();
        after(500, () => speak(`${word.text.split("").join(", ")}. ${word.text.toLowerCase()}`));
        after(3200 + word.text.length * 450, () => advance(nextScore));
      }
    } else {
      setMistakes((m) => m + 1);
      beep(180, 0.25, "sawtooth");
      setShakeId(null);
      after(0, () => setShakeId(t.id));
      after(400, () => setShakeId(null));
      setMsg("Ups, coba huruf lain 🤔");
      speak("Coba lagi");
    }
  }

  function skip() {
    if (locked) return;
    setLocked(true);
    advance(score);
  }

  return (
    <>
      <RoundBar left={`Kata ${idx + 1} dari ${words.length}`} score={score} />
      <div className={css.pic} aria-label={`Gambar ${word.item.name}`} role="img">
        {word.item.emoji}
      </div>
      <div className={css.slots} aria-label={`Kata dengan ${word.text.length} huruf`}>
        {word.text.split("").map((c, i) =>
          i < pos ? (
            <div key={i} className={`${css.slot} ${css.fill}`}>
              {c}
            </div>
          ) : (
            <div key={i} className={`${css.slot} ${cfg.ghost ? css.ghost : ""} ${i === pos ? css.next : ""}`}>
              {cfg.ghost ? c : ""}
            </div>
          ),
        )}
      </div>
      <Msg>{msg}</Msg>
      <div className={css.tray}>
        {tray.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`${css.tile} ${used.has(t.id) ? css.used : ""} ${shakeId === t.id ? css.shake : ""}`}
            onClick={() => onTile(t)}
            aria-label={`Huruf ${t.ch}`}
            disabled={used.has(t.id)}
          >
            {t.ch}
          </button>
        ))}
      </div>
      <div className="row">
        <button type="button" className="btn" disabled={!voice} onClick={() => speak(word.text.toLowerCase())}>
          🔊 Dengar kata
        </button>
        <button type="button" className="btn" onClick={skip}>
          ⏭ Lewati
        </button>
      </div>
    </>
  );
}
