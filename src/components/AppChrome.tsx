"use client";

import { useEffect } from "react";
import { initVoices, music, stopSpeech, speak } from "@/engine/audio";
import { settingsStore, updateSettings, useSettings } from "@/engine/settings";
import { PwaRegister } from "./PwaRegister";

/**
 * Hal-hal global: membuka kunci audio pada sentuhan pertama (aturan browser),
 * menjalankan musik latar, tombol musik/suara di pojok, dan mendaftarkan PWA.
 */
export function AppChrome() {
  const s = useSettings();

  useEffect(() => {
    initVoices();
    let unlocked = false;

    const go = () => {
      unlocked = true;
      if (settingsStore.get().music) music.start();
    };
    const evs = ["pointerdown", "keydown", "touchstart"] as const;
    evs.forEach((e) => document.addEventListener(e, go, { passive: true }));

    const onVis = () => {
      if (document.hidden) {
        music.stop();
        stopSpeech();
      } else if (unlocked && settingsStore.get().music) music.start();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      evs.forEach((e) => document.removeEventListener(e, go));
      document.removeEventListener("visibilitychange", onVis);
      music.stop();
    };
  }, []);

  useEffect(() => {
    if (!s.music) music.stop();
  }, [s.music]);

  return (
    <>
      <div className="fab">
        <button
          type="button"
          aria-label={s.voice ? "Matikan suara pembaca" : "Nyalakan suara pembaca"}
          aria-pressed={s.voice}
          title={s.voice ? "Matikan suara pembaca" : "Nyalakan suara pembaca"}
          onClick={() => {
            const next = !s.voice;
            updateSettings({ voice: next });
            if (next) setTimeout(() => speak("Suara menyala"), 0);
            else stopSpeech();
          }}
        >
          {s.voice ? "🗣️" : "🤐"}
        </button>
        <button
          type="button"
          aria-label={s.music ? "Matikan musik" : "Nyalakan musik"}
          aria-pressed={s.music}
          title={s.music ? "Matikan musik" : "Nyalakan musik"}
          onClick={() => {
            const next = !s.music;
            updateSettings({ music: next });
            if (next) setTimeout(() => music.start(), 0);
          }}
        >
          {s.music ? "🎵" : "🔇"}
        </button>
      </div>
      <PwaRegister />
    </>
  );
}
