"use client";

import { useEffect, useState } from "react";
import { beep, sfx, speak } from "@/engine/audio";
import { numberWord } from "@/content/items";
import { useTimers } from "@/engine/timers";
import type { PlayProps } from "@/engine/types";
import { Msg, praise, RoundBar } from "@/engine/ui";
import { LEVEL_CONFIG, makeQuestion, ROUNDS, stageFor, type Group } from "./logic";
import css from "./Hitung.module.css";

export function HitungPlay({ level, onFinish }: PlayProps) {
  const cfg = LEVEL_CONFIG[level.id] ?? LEVEL_CONFIG.mudah;
  const { after, clear } = useTimers();

  const [idx, setIdx] = useState(0);
  const [q, setQ] = useState(() => makeQuestion(cfg));
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  /** urutan gambar yang sudah disentuh (indeks) untuk menghitung satu-satu */
  const [tapped, setTapped] = useState<number[]>([]);

  // bacakan soal setiap kali soal baru muncul
  useEffect(() => {
    const t = after(200, () => speak(q.say));
    return () => clear(t);
  }, [q, after, clear]);

  const stage = stageFor(q);

  function answer(v: number) {
    if (locked) return;
    setLocked(true);
    setPicked(v);
    const ok = v === q.answer;
    const ns = score + (ok ? 1 : 0);
    if (ok) {
      setScore(ns);
      sfx.good();
      setMsg(praise());
      speak(`Benar! ${numberWord(q.answer)}`);
    } else {
      sfx.bad();
      setMsg(`Hampir! Jawabannya ${q.answer}`);
      speak(`Jawabannya ${numberWord(q.answer)}`);
    }
    after(ok ? 1600 : 2400, () => {
      if (idx + 1 >= ROUNDS) {
        onFinish({ score: ns, total: ROUNDS });
        return;
      }
      setIdx(idx + 1);
      setQ(makeQuestion(cfg));
      setLocked(false);
      setPicked(null);
      setMsg("");
      setTapped([]);
    });
  }

  function countOne(i: number) {
    if (tapped.includes(i)) return;
    const n = tapped.length + 1;
    setTapped([...tapped, i]);
    beep(400 + n * 40, 0.1);
    speak(numberWord(n));
  }

  return (
    <>
      <RoundBar left={`Soal ${idx + 1} dari ${ROUNDS}`} score={score} />
      <div className="ask">{q.text}</div>

      <div className={`stage ${css.board}`}>
        {stage.kind === "text" ? (
          <span className={css.eq}>{q.text}</span>
        ) : (
          <>
            {stage.groups.map((g, gi) => (
              <GroupView
                key={gi}
                g={g}
                label={q.thing.name}
                op={gi === 1 ? stage.op : null}
                countable={stage.countable}
                tapped={tapped}
                onCount={countOne}
              />
            ))}
            {stage.countable && <div className={css.hint}>👆 Sentuh gambar untuk menghitung satu-satu</div>}
          </>
        )}
      </div>

      <Msg>{msg}</Msg>

      <div className={`${css.opts} ${locked ? css.locked : ""}`} data-n={q.options.length} style={{ ["--n" as string]: q.options.length }}>
        {q.options.map((v) => (
          <button
            key={v}
            type="button"
            className={`choice${locked && v === q.answer ? " ok" : ""}${locked && picked === v && v !== q.answer ? " no" : ""}`}
            onClick={() => answer(v)}
            aria-label={`Jawaban ${v}`}
          >
            {v}
          </button>
        ))}
      </div>

      <button type="button" className="btn" onClick={() => speak(q.say)}>
        🔊 Ulangi soal
      </button>
    </>
  );
}

function GroupView({
  g,
  label,
  op,
  countable,
  tapped,
  onCount,
}: {
  g: Group;
  label: string;
  op: "+" | "−" | null;
  countable: boolean;
  tapped: number[];
  onCount: (i: number) => void;
}) {
  return (
    <>
      {op && (
        <span className={css.op} aria-label={op === "+" ? "tambah" : "kurang"}>
          {op}
        </span>
      )}
      <div className={css.grp} role="group" aria-label={`${g.count} ${label}`}>
        {Array.from({ length: g.count }, (_, i) => {
          const order = tapped.indexOf(i);
          if (!countable) {
            return (
              <span key={i} className={css.obj} aria-hidden>
                {g.emoji}
              </span>
            );
          }
          return (
            <button
              key={i}
              type="button"
              className={`${css.obj} ${css.countable} ${order >= 0 ? css.hop : ""}`}
              onClick={() => onCount(i)}
              aria-label={`Hitung ${label} ke-${i + 1}`}
            >
              {g.emoji}
              {order >= 0 && <i className={css.badge}>{order + 1}</i>}
            </button>
          );
        })}
      </div>
    </>
  );
}
