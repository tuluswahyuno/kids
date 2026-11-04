"use client";

import { useEffect, useRef, useState } from "react";
import type { ContentItem } from "@/content/items";
import { beep, sfx, speak } from "@/engine/audio";
import { useTimers } from "@/engine/timers";
import type { PlayProps } from "@/engine/types";
import { Msg, praise, RoundBar } from "@/engine/ui";
import { LEVEL_CONFIG, pickBoards, shuffleDifferent, totalPairs } from "./logic";
import css from "./PasangKata.module.css";

export function PasangKataPlay({ level, category, onFinish }: PlayProps) {
  const cfg = LEVEL_CONFIG[level.id] ?? LEVEL_CONFIG.mudah;
  const total = totalPairs(cfg);
  const { after } = useTimers();

  const [boards] = useState(() => pickBoards(category, cfg));
  const [bi, setBi] = useState(0);
  const [words, setWords] = useState<ContentItem[]>(() => shuffleDifferent(boards[0]));
  const [sel, setSel] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [errored, setErrored] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [msg, setMsg] = useState("");
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  });

  const board = boards[bi];

  useEffect(() => {
    const t = setTimeout(() => speak("Pasangkan gambar dengan tulisannya"), 200);
    return () => clearTimeout(t);
  }, [bi]);

  function nextBoard(sc: number) {
    const next = bi + 1;
    if (next >= boards.length) {
      onFinishRef.current({ score: sc, total });
      return;
    }
    setBi(next);
    setWords(shuffleDifferent(boards[next]));
    setSel(null);
    setMatched(new Set());
    setErrored(new Set());
    setMsg("");
    setBusy(false);
  }

  function onPic(id: string) {
    if (busy || matched.has(id)) return;
    setSel(id);
    beep(500, 0.08);
  }

  function onWord(item: ContentItem) {
    if (busy || matched.has(item.id)) return;
    speak(item.name.toLowerCase());
    if (!sel) {
      setMsg("Pilih gambar dulu ya 👈");
      return;
    }
    if (sel === item.id) {
      const nm = new Set(matched).add(item.id);
      const sc = score + (errored.has(item.id) ? 0 : 1);
      setMatched(nm);
      setScore(sc);
      setSel(null);
      setMsg(praise());
      sfx.good();
      if (nm.size === board.length) {
        setBusy(true);
        after(1800, () => nextBoard(sc));
      }
    } else {
      setErrored((e) => new Set(e).add(sel));
      setShakeId(null);
      after(0, () => setShakeId(item.id));
      after(400, () => setShakeId(null));
      setMsg("Belum cocok, coba lagi 🤔");
      sfx.bad();
    }
  }

  return (
    <>
      <RoundBar left={`Papan ${bi + 1} dari ${boards.length}`} score={score} />
      <p className="sub">Sentuh gambar, lalu sentuh tulisan yang cocok 👆</p>
      <div className={css.board}>
        <div className={css.col}>
          {board.map((it) => (
            <button
              key={it.id}
              type="button"
              className={`${css.pic} ${sel === it.id ? css.pick : ""} ${matched.has(it.id) ? css.done : ""}`}
              aria-label={`Gambar ${it.name}`}
              aria-pressed={sel === it.id}
              onClick={() => onPic(it.id)}
            >
              {it.emoji}
            </button>
          ))}
        </div>
        <div className={css.col}>
          {words.map((it) => (
            <button
              key={it.id}
              type="button"
              className={`${css.word} ${matched.has(it.id) ? css.done : ""} ${shakeId === it.id ? css.shake : ""}`}
              onClick={() => onWord(it)}
            >
              {it.name}
            </button>
          ))}
        </div>
      </div>
      <Msg>{msg}</Msg>
    </>
  );
}
