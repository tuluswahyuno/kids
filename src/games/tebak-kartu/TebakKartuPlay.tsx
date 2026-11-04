"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { itemsFor, type ContentItem } from "@/content/items";
import { beep, sfx, speak, stopSpeech } from "@/engine/audio";
import { useSettings } from "@/engine/settings";
import { useTimers } from "@/engine/timers";
import type { PlayProps } from "@/engine/types";
import { Msg, praise, TimerBar } from "@/engine/ui";
import { buildOptions, choiceCols, LEVEL_CONFIG, pickDeck, questionOrder, ROUNDS } from "./logic";
import css from "./TebakKartu.module.css";

type Phase = "memo" | "closing" | "quiz";
type CardState = "right" | "wrong";

export function TebakKartuPlay({ level, category, onFinish }: PlayProps) {
  const cfg = LEVEL_CONFIG[level.id] ?? LEVEL_CONFIG.mudah;
  const { text, voice } = useSettings();
  const { after, every, clear } = useTimers();

  // semua keputusan acak diambil sekali di awal (bukan saat render)
  const [deck] = useState(() => pickDeck(category, ROUNDS));
  const [order] = useState(() => questionOrder(ROUNDS, cfg.shuffled));
  const [pool] = useState(() => itemsFor(category));

  const [phase, setPhase] = useState<Phase>("memo");
  const [memoLeft, setMemoLeft] = useState(cfg.memo);
  const [qi, setQi] = useState(0);
  const [curIdx, setCurIdx] = useState<number | null>(null);
  const [options, setOptions] = useState<ContentItem[]>([]);
  const [results, setResults] = useState<Record<number, CardState>>({});
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [correctId, setCorrectId] = useState<string | null>(null);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [qFrac, setQFrac] = useState(1);
  const [qWarn, setQWarn] = useState(false);

  // onFinish berganti identitas tiap render induk -> simpan di ref
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  });

  const memoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const qTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const resolveRef = useRef<((choice: ContentItem | null) => void) | null>(null);
  const startedQuiz = useRef(false);
  const askRef = useRef<(i: number, sc: number) => void>(() => {});

  /** Mulai satu pertanyaan ke-i dengan skor sementara sc. */
  const ask = useCallback(
    (i: number, sc: number) => {
      if (i >= ROUNDS) {
        onFinishRef.current({ score: sc, total: ROUNDS });
        return;
      }
      const idx = order[i];
      const correct = deck[idx];
      let done = false;

      setQi(i);
      setCurIdx(idx);
      setCorrectId(correct.id);
      setPickedId(null);
      setLocked(false);
      setMsg("");
      setOptions(buildOptions(correct, deck, pool, cfg));
      speak(`Kartu nomor ${idx + 1}, gambar apa?`);

      const resolve = (choice: ContentItem | null) => {
        if (done) return;
        done = true;
        clear(qTimer.current);
        qTimer.current = null;
        const ok = choice?.id === correct.id;
        const sc2 = sc + (ok ? 1 : 0);
        setScore(sc2);
        setLocked(true);
        setPickedId(choice?.id ?? null);
        setResults((r) => ({ ...r, [idx]: ok ? "right" : "wrong" }));
        if (ok) {
          sfx.good();
          setMsg(praise());
          after(350, () => speak(`Benar! ${correct.name}`));
        } else {
          sfx.bad();
          setMsg(choice ? `Hampir! Jawabannya ${correct.name} ${correct.emoji}` : `Waktu habis! Jawabannya ${correct.name} ${correct.emoji}`);
          after(350, () => speak(`Jawabannya ${correct.name}`));
        }
        after(ok ? 1500 : 2400, () => askRef.current(i + 1, sc2));
      };
      resolveRef.current = resolve;

      if (cfg.qTime > 0) {
        const t0 = performance.now();
        setQFrac(1);
        setQWarn(false);
        qTimer.current = every(250, () => {
          const left = cfg.qTime - (performance.now() - t0) / 1000;
          setQFrac(left / cfg.qTime);
          setQWarn(left <= 3);
          if (left <= 0) resolve(null);
        });
      }
    },
    [order, deck, pool, cfg, after, every, clear],
  );

  useEffect(() => {
    askRef.current = ask;
  }, [ask]);

  const beginQuiz = useCallback(() => {
    if (startedQuiz.current) return;
    startedQuiz.current = true;
    clear(memoTimer.current);
    memoTimer.current = null;
    stopSpeech();
    setPhase("closing");
    beep(440, 0.1);
    after(650, () => {
      setPhase("quiz");
      ask(0, 0);
    });
  }, [after, ask, clear]);

  // hitung mundur waktu menghafal
  useEffect(() => {
    let left = cfg.memo;
    memoTimer.current = every(1000, () => {
      left -= 1;
      setMemoLeft(Math.max(0, left));
      if (left <= 0) beginQuiz();
    });
    return () => clear(memoTimer.current);
  }, [cfg.memo, every, clear, beginQuiz]);

  function onCard(i: number) {
    if (phase === "memo") speak(deck[i].name);
  }

  function readAll() {
    stopSpeech();
    deck.forEach((c, i) => speak(`${i + 1}. ${c.name}`, { queue: i > 0 }));
  }

  const memoPhase = phase === "memo";

  return (
    <>
      {memoPhase || phase === "closing" ? (
        <div className="roundbar">
          <span>
            {level.emoji} {level.name}
          </span>
          <span>⏱ {memoLeft} detik</span>
        </div>
      ) : (
        <div className="roundbar">
          <span>
            Kartu ke-{qi + 1} dari {ROUNDS}
          </span>
          <span aria-label={`Skor ${score}`}>⭐ {score}</span>
        </div>
      )}

      {memoPhase ? (
        <TimerBar fraction={memoLeft / cfg.memo} warn={memoLeft <= 10} />
      ) : (
        <TimerBar fraction={qFrac} warn={qWarn} hidden={cfg.qTime === 0 || phase !== "quiz"} />
      )}

      {memoPhase && <p className="ask">👀 Lihat dan ingat kartunya!</p>}

      <div className={css.grid} role="list">
        {deck.map((c, i) => {
          const res = results[i];
          const down = !memoPhase && !res;
          const cls = [
            css.flip,
            down ? css.down : "",
            phase === "quiz" && curIdx === i && !locked ? css.cur : "",
            res === "right" ? css.right : "",
            res === "wrong" ? css.wrong : "",
          ].join(" ");
          const label = down ? `Kartu nomor ${i + 1}, tertutup` : `Kartu nomor ${i + 1}: ${c.name}`;
          const inner = (
            <div className={css.inner}>
              <div className={`${css.face} ${css.front}`}>
                <span className={css.num}>{i + 1}</span>
                <span className={css.emoji} aria-hidden>
                  {c.emoji}
                </span>
                <span className={css.name}>{text ? c.name : ""}</span>
              </div>
              <div className={`${css.face} ${css.back}`}>{i + 1}</div>
            </div>
          );
          return memoPhase ? (
            <button key={c.id} type="button" role="listitem" className={cls} aria-label={label} onClick={() => onCard(i)}>
              {inner}
            </button>
          ) : (
            <div key={c.id} role="listitem" className={cls} aria-label={label}>
              {inner}
            </div>
          );
        })}
      </div>

      {memoPhase && (
        <>
          <p className="sub">👆 Sentuh kartu untuk mendengar namanya</p>
          <button type="button" className="btn" disabled={!voice} onClick={readAll}>
            🔊 Bacakan semua kartu
          </button>
          <button type="button" className="btn ok xl" onClick={beginQuiz}>
            Saya sudah ingat! ✅
          </button>
        </>
      )}

      {phase === "quiz" && curIdx !== null && (
        <>
          <p className="ask">Kartu nomor {curIdx + 1} gambar apa?</p>
          <div
            className={`choices${locked ? " lock" : ""}`}
            style={{ ["--cols" as string]: choiceCols(cfg.opts) }}
          >
            {options.map((o) => {
              const state = locked ? (o.id === correctId ? " ok" : o.id === pickedId ? " no" : "") : "";
              return (
                <button
                  key={o.id}
                  type="button"
                  className={`choice${state}`}
                  aria-label={text ? o.name : `Pilihan ${o.emoji}`}
                  onClick={() => resolveRef.current?.(o)}
                >
                  {o.emoji}
                  <small>{text ? o.name : ""}</small>
                </button>
              );
            })}
          </div>
          <Msg>{msg}</Msg>
        </>
      )}
    </>
  );
}
