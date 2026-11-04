"use client";

import { useEffect, useRef, useState } from "react";
import { beep, sfx, speak } from "@/engine/audio";
import { useTimers } from "@/engine/timers";
import type { PlayProps } from "@/engine/types";
import { Msg, praise, RoundBar } from "@/engine/ui";
import {
  BALLOON_COLORS,
  buildRound,
  correctSpeech,
  kindLabel,
  LEVEL_CONFIG,
  missSpeech,
  parseMode,
  pickTargets,
  promptSpeech,
  roundTimeoutMs,
  ROUNDS,
  wrongText,
  type Balloon,
} from "./logic";
import css from "./PecahBalon.module.css";

type Phase = "live" | "done";

export function PecahBalonPlay({ level, category, onFinish }: PlayProps) {
  const cfg = LEVEL_CONFIG[level.id] ?? LEVEL_CONFIG.mudah;
  const mode = parseMode(category);
  const { after, clear } = useTimers();

  const [targets] = useState(() => pickTargets(mode, cfg));
  const [idx, setIdx] = useState(0);
  const [round, setRound] = useState(() => buildRound(mode, cfg, targets[0], 0));
  const [phase, setPhase] = useState<Phase>("live");
  const [score, setScore] = useState(0);
  const [msg, setMsg] = useState("");
  const [popped, setPopped] = useState<number | null>(null);
  const [wob, setWob] = useState<{ id: number; n: number } | null>(null);

  const arenaRef = useRef<HTMLDivElement>(null);
  const els = useRef(new Map<number, HTMLButtonElement>());
  const anims = useRef(new Map<number, Animation>());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // penjaga sinkron: mencegah dua sentuhan beruntun menghitung dua kali
  const phaseRef = useRef<Phase>("live");
  const missRef = useRef<() => void>(() => {});

  function advance(newScore: number) {
    const next = idx + 1;
    if (next >= ROUNDS) {
      onFinish({ score: newScore, total: ROUNDS });
      return;
    }
    phaseRef.current = "live";
    setPhase("live");
    setIdx(next);
    setPopped(null);
    setWob(null);
    setMsg("");
    setRound(buildRound(mode, cfg, targets[next], next));
  }

  function miss() {
    if (phaseRef.current !== "live") return;
    phaseRef.current = "done";
    setPhase("done");
    setMsg(`Yah, balon ${round.target} terbang pergi 🎈`);
    beep(200, 0.3, "sawtooth");
    speak(missSpeech(mode, round.target));
    after(2200, () => advance(score));
  }

  useEffect(() => {
    missRef.current = miss;
  });

  // Mulai putaran: ucapkan perintah, luncurkan balon, pasang batas waktu.
  useEffect(() => {
    speak(promptSpeech(mode, round.target));
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const rise = (arenaRef.current?.clientHeight ?? 400) + 240;
        for (const b of round.balloons) {
          const el = els.current.get(b.id);
          if (!el || typeof el.animate !== "function") continue;
          anims.current.set(
            b.id,
            el.animate(
              [{ transform: "translateY(0)" }, { transform: `translateY(${-rise}px)` }],
              { duration: b.duration * 1000, delay: b.delay * 1000, easing: "linear", fill: "both" },
            ),
          );
        }
      });
    });
    const tid = after(roundTimeoutMs(cfg), () => missRef.current());
    timerRef.current = tid;
    const running = anims.current;
    return () => {
      timerRef.current = null;
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clear(tid);
      running.forEach((a) => a.cancel());
      running.clear();
    };
  }, [round, mode, cfg, after, clear]);

  function tap(b: Balloon) {
    if (phaseRef.current !== "live") return;
    if (b.value === round.target) {
      phaseRef.current = "done";
      setPhase("done");
      clear(timerRef.current);
      anims.current.get(b.id)?.pause(); // bekukan di tempat lalu letus
      const ns = score + 1;
      setScore(ns);
      setPopped(b.id);
      setMsg(praise());
      sfx.pop();
      speak(correctSpeech(mode, round.target));
      after(1600, () => advance(ns));
    } else {
      // salah: balon hanya bergoyang, tanpa hukuman
      beep(180, 0.25, "sawtooth");
      setWob((w) => ({ id: b.id, n: (w?.n ?? 0) + 1 }));
      setMsg(wrongText(mode, b.value, round.target));
    }
  }

  const label = kindLabel(mode);

  return (
    <>
      <RoundBar left={`Balon ke-${idx + 1} dari ${ROUNDS}`} score={score} />
      <div className="ask">
        Pecahkan {label} <b className={css.target}>{round.target}</b>
      </div>
      <div ref={arenaRef} className={css.arena} style={{ ["--n" as string]: round.balloons.length }} role="group" aria-label={`Arena balon. Cari ${label} ${round.target}`}>
        {round.balloons.map((b) => (
          <button
            key={`${round.no}-${b.id}`}
            ref={(el) => {
              if (el) els.current.set(b.id, el);
              else els.current.delete(b.id);
            }}
            type="button"
            className={css.balloon}
            style={{ left: `calc((100% - var(--bw)) * ${b.frac})` }}
            aria-label={`Balon ${label} ${b.value}`}
            aria-disabled={phase === "done"}
            // sentuhan: respons instan saat jari menekan; keyboard: lewat click (detail 0)
            onPointerDown={() => tap(b)}
            onClick={(e) => {
              if (e.detail === 0) tap(b);
            }}
          >
            <span
              className={[
                css.body,
                popped === b.id ? css.pop : "",
                wob?.id === b.id ? (wob.n % 2 ? css.wobA : css.wobB) : "",
              ].join(" ")}
              style={{ background: BALLOON_COLORS[b.color] }}
            >
              {b.value}
            </span>
          </button>
        ))}
      </div>
      <Msg>{msg}</Msg>
      <button type="button" className="btn" onClick={() => speak(promptSpeech(mode, round.target))}>
        🔊 Ulangi perintah
      </button>
    </>
  );
}
