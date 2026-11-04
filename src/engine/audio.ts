"use client";

import { settingsStore } from "./settings";

/* ------------------------------------------------------------------ *
 *  Suara pembaca
 *  1. Jika ada klip rekaman (clip) -> diputar (kualitas sama di semua perangkat)
 *  2. Jika tidak -> TTS bawaan perangkat (Bahasa Indonesia bila tersedia)
 * ------------------------------------------------------------------ */

let idVoice: SpeechSynthesisVoice | null = null;
let clipEl: HTMLAudioElement | null = null;

const synth = () => (typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null);

function pickVoice() {
  const s = synth();
  if (!s) return;
  const vs = s.getVoices();
  idVoice =
    vs.find((v) => /^id[-_]/i.test(v.lang)) ?? vs.find((v) => /indonesia/i.test(v.name)) ?? null;
}

export function initVoices() {
  const s = synth();
  if (!s) return;
  pickVoice();
  s.onvoiceschanged = pickVoice;
}

export interface SpeakOptions {
  pitch?: number;
  rate?: number;
  /** antre di belakang ucapan yang sedang berjalan */
  queue?: boolean;
  /** URL rekaman (mis. "/audio/harimau.mp3"); jika gagal dimuat, jatuh ke TTS */
  clip?: string;
}

export function speak(text: string, opts: SpeakOptions = {}) {
  if (!settingsStore.get().voice) return;
  const s = synth();
  if (opts.clip && typeof Audio !== "undefined") {
    clipEl?.pause();
    clipEl = new Audio(opts.clip);
    clipEl.onerror = () => speakTts(text, opts);
    void clipEl.play().catch(() => speakTts(text, opts));
    return;
  }
  if (!s) return;
  speakTts(text, opts);
}

function speakTts(text: string, opts: SpeakOptions) {
  const s = synth();
  if (!s) return;
  if (!opts.queue) s.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "id-ID";
  if (idVoice) u.voice = idVoice;
  u.rate = opts.rate ?? 0.8;
  u.pitch = opts.pitch ?? 1.1;
  s.speak(u);
}

export function stopSpeech() {
  synth()?.cancel();
  clipEl?.pause();
}

export const isSpeaking = () => !!synth()?.speaking;

/* ------------------------------------------------------------------ *
 *  Efek bunyi (WebAudio, tanpa file)
 * ------------------------------------------------------------------ */

let ctx: AudioContext | null = null;

export function audioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = ctx ?? new AC();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function beep(freq: number, dur = 0.15, type: OscillatorType = "sine", delay = 0) {
  if (!settingsStore.get().sfx) return;
  const c = audioCtx();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.12, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur);
}

export const sfx = {
  tap: () => beep(500, 0.08),
  good: () => {
    beep(660, 0.12);
    beep(880, 0.18, "sine", 0.11);
  },
  bad: () => beep(180, 0.3, "sawtooth"),
  pop: () => {
    beep(300, 0.1, "square");
    beep(900, 0.12, "sine", 0.06);
    beep(1200, 0.15, "sine", 0.06);
  },
  win: () => [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.2, "sine", i * 0.14)),
};

/* ------------------------------------------------------------------ *
 *  Musik latar (dibuat prosedural: bass + akor + arpeggio + melodi)
 * ------------------------------------------------------------------ */

const CHORDS = [
  [60, 64, 67], // C
  [57, 60, 64], // Am
  [53, 57, 60], // F
  [55, 59, 62], // G
];
const PENTA = [72, 74, 76, 79, 81, 84, 86, 88];
const mf = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
const VOL = 0.05;

class Music {
  private master: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private duckTimer: ReturnType<typeof setInterval> | null = null;
  private nextT = 0;
  private step = 0;
  private melIdx = 3;
  private tempo = 100;
  running = false;

  setTempo(bpm: number) {
    this.tempo = bpm;
  }

  private note(m: number, t: number, dur: number, type: OscillatorType, gain: number, attack = 0.01) {
    const c = ctx!;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = mf(m);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(this.master!);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  private schedule = () => {
    const c = ctx;
    if (!c || !this.master) return;
    const eighth = 60 / this.tempo / 2;
    while (this.nextT < c.currentTime + 0.5) {
      const bar = (this.step >> 3) % 4;
      const pos = this.step & 7;
      const chord = CHORDS[bar];
      const t = this.nextT;

      if (pos === 0 || pos === 4) this.note(chord[0] - 12, t, eighth * 3.6, "sine", 0.9, 0.02);
      if (pos === 0) chord.forEach((m) => this.note(m, t, eighth * 7.5, "triangle", 0.16, 0.08));
      if (pos % 2 === 1) this.note(chord[(pos >> 1) % 3] + 12, t, eighth * 1.4, "sine", 0.22);

      if (Math.random() < 0.78) {
        if (pos % 4 === 0) {
          let best = this.melIdx;
          let bd = 99;
          PENTA.forEach((p, i) => {
            if (chord.some((cm) => (p - cm) % 12 === 0)) {
              const far = Math.abs(i - this.melIdx);
              if (far < bd) {
                bd = far;
                best = i;
              }
            }
          });
          this.melIdx = best;
        } else {
          const stepDelta = [-2, -1, -1, 1, 1, 2][Math.floor(Math.random() * 6)];
          this.melIdx = Math.max(0, Math.min(PENTA.length - 1, this.melIdx + stepDelta));
        }
        this.note(PENTA[this.melIdx], t, eighth * (pos % 2 ? 1.2 : 1.8), "triangle", 0.55);
      }
      this.nextT += eighth;
      this.step++;
    }
  };

  start() {
    if (this.running || !settingsStore.get().music) return;
    const c = audioCtx();
    if (!c) return;
    this.master = c.createGain();
    this.master.gain.value = VOL;
    this.master.connect(c.destination);
    this.nextT = c.currentTime + 0.1;
    this.running = true;
    this.timer = setInterval(this.schedule, 120);
    // kecilkan musik ketika suara pembaca bicara
    this.duckTimer = setInterval(() => {
      if (!this.master || !ctx) return;
      this.master.gain.setTargetAtTime(isSpeaking() ? VOL * 0.3 : VOL, ctx.currentTime, 0.15);
    }, 150);
  }

  stop() {
    this.running = false;
    if (this.timer) clearInterval(this.timer);
    if (this.duckTimer) clearInterval(this.duckTimer);
    this.timer = this.duckTimer = null;
    try {
      this.master?.disconnect();
    } catch {
      /* sudah terputus */
    }
    this.master = null;
  }
}

export const music = new Music();
