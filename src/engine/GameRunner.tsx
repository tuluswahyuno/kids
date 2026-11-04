"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { music, sfx, speak, stopSpeech } from "./audio";
import { useEntitlement } from "./entitlement";
import { Paywall } from "./Paywall";
import { activeProfile, useProfiles } from "./profiles";
import { bestScore, recordSession, starsFor, useProgress } from "./progress";
import { updateSettings, useSettings } from "./settings";
import { Stars } from "./ui";
import { totalFor, type FinishResult, type GameDefinition, type Level } from "./types";

type Phase = "menu" | "play" | "result";

interface Chosen {
  levelId: string;
  category: string;
}

/**
 * Pembungkus semua game: menu (tingkat + tema) -> main -> hasil.
 * Game hanya perlu mengurus soal-soalnya; skor, bintang, rekor, pengunci premium,
 * musik, dan tombol keluar semua ditangani di sini.
 */
export function GameRunner({ def }: { def: GameDefinition }) {
  const settings = useSettings();
  const profiles = useProfiles();
  const progress = useProgress();
  const ent = useEntitlement();

  const profileId = activeProfile(profiles)?.id ?? "tamu";

  const [phase, setPhase] = useState<Phase>("menu");
  const [chosen, setChosen] = useState<Chosen>({
    levelId: def.levels[0].id,
    category: def.defaultCategory ?? def.categories?.[0]?.id ?? "-",
  });
  const [runId, setRunId] = useState(0);
  const [result, setResult] = useState<(FinishResult & { isNewBest: boolean; prevBest: number | null }) | null>(null);
  const [paywall, setPaywall] = useState(false);

  const level: Level = def.levels.find((l) => l.id === chosen.levelId) ?? def.levels[0];
  const total = totalFor(def, level);
  const locked = (l: Level) => !!l.premium && !ent.isPremium;

  useEffect(() => {
    music.setTempo(def.tempo);
    return () => {
      music.setTempo(110);
      stopSpeech();
    };
  }, [def.tempo]);

  const best = bestScore(progress, { profileId, gameId: def.id, levelId: level.id, category: chosen.category });

  function start() {
    if (locked(level)) return setPaywall(true);
    setRunId((n) => n + 1);
    setPhase("play");
  }

  function finish(r: FinishResult) {
    const prevBest = bestScore(progress, { profileId, gameId: def.id, levelId: level.id, category: chosen.category });
    recordSession({
      profileId,
      gameId: def.id,
      levelId: level.id,
      category: chosen.category,
      score: r.score,
      total: r.total,
    });
    setResult({ ...r, isNewBest: prevBest === null || r.score > prevBest, prevBest });
    setPhase("result");
    const stars = starsFor(r.score, r.total);
    if (stars >= 2) sfx.win();
    speak(stars >= 2 ? "Hebat sekali!" : "Ayo coba lagi!");
  }

  const style = { "--accent": def.color, "--soft": def.soft } as CSSProperties;
  const nextLevel = def.levels[def.levels.findIndex((l) => l.id === level.id) + 1];

  return (
    <div className="gamepage" style={style}>
      {phase !== "play" && (
        <Link className="backlink" href="/">
          ← Menu Game
        </Link>
      )}

      {phase === "menu" && (
        <section className="screen">
          <h1 className="gametitle">
            <span aria-hidden>{def.emoji}</span> {def.title}
          </h1>
          <p className="sub">{def.blurb}</p>

          <div className="group-title">Pilih tingkat:</div>
          <div className="pickgrid levels">
            {def.levels.map((l) => (
              <button
                key={l.id}
                type="button"
                className={`pick${l.id === level.id ? " sel" : ""}${locked(l) ? " locked" : ""}`}
                aria-pressed={l.id === level.id}
                onClick={() => (locked(l) ? setPaywall(true) : setChosen((c) => ({ ...c, levelId: l.id })))}
              >
                <b>
                  {l.emoji} {l.name} {locked(l) && <span aria-label="terkunci">🔒</span>}
                </b>
                <small>{l.desc}</small>
              </button>
            ))}
          </div>

          {def.categories && (
            <>
              <div className="group-title">{def.categoryTitle ?? "Pilih tema:"}</div>
              <div className="pickgrid cats">
                {def.categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`pick cat${c.id === chosen.category ? " sel" : ""}`}
                    aria-pressed={c.id === chosen.category}
                    onClick={() => setChosen((x) => ({ ...x, category: c.id }))}
                  >
                    <span className="big-emoji">{c.emoji}</span>
                    {c.name}
                  </button>
                ))}
              </div>
            </>
          )}

          <label className="toggle">
            <input type="checkbox" checked={settings.voice} onChange={(e) => {
              updateSettings({ voice: e.target.checked });
              if (e.target.checked) setTimeout(() => speak("Suara menyala"), 0);
              else stopSpeech();
            }} />
            🔊 Suara membacakan kata
          </label>
          {def.usesText && (
            <label className="toggle">
              <input type="checkbox" checked={settings.text} onChange={(e) => updateSettings({ text: e.target.checked })} />
              🔤 Tampilkan tulisan di setiap kartu (untuk belajar membaca)
            </label>
          )}

          <button type="button" className="btn primary xl" onClick={start}>
            ▶ Mulai Main
          </button>
          <div className="best">
            {best !== null ? `Skor terbaik: ${best}/${total}` : "Belum ada skor. Ayo coba!"}
          </div>
        </section>
      )}

      {phase === "play" && (
        <section className="screen play">
          <button type="button" className="quit" onClick={() => { stopSpeech(); setPhase("menu"); }} aria-label="Keluar dari permainan">
            ✕ Keluar
          </button>
          <def.Play key={runId} level={level} category={chosen.category} onFinish={finish} />
        </section>
      )}

      {phase === "result" && result && (
        <section className="screen result">
          <h1 className="gametitle">
            {result.score === result.total ? "SEMPURNA! 🏆" : starsFor(result.score, result.total) >= 2 ? "Kerja bagus! 🎉" : "Ayo coba lagi! 💪"}
          </h1>
          <Stars n={starsFor(result.score, result.total)} />
          <div className="bigscore">
            {result.score} / {result.total}
          </div>
          <p>
            {result.isNewBest ? "🎊 Skor terbaik baru! " : `Skor terbaik: ${result.prevBest}/${result.total}. `}
            {nextLevel && result.score / result.total >= 0.8 && (locked(nextLevel) ? "Buka Premium untuk tingkat berikutnya!" : "Coba tingkat berikutnya!")}
          </p>
          <div className="row">
            <button type="button" className="btn primary xl" onClick={start}>
              🔁 Main Lagi
            </button>
            {nextLevel && result.score / result.total >= 0.8 && (
              <button
                type="button"
                className="btn"
                onClick={() => {
                  if (locked(nextLevel)) return setPaywall(true);
                  setChosen((c) => ({ ...c, levelId: nextLevel.id }));
                  setRunId((n) => n + 1);
                  setPhase("play");
                }}
              >
                ⏭ {nextLevel.name}
              </button>
            )}
            <button type="button" className="btn" onClick={() => setPhase("menu")}>
              🏠 Menu
            </button>
          </div>
        </section>
      )}

      {paywall && <Paywall onClose={() => setPaywall(false)} />}
    </div>
  );
}
