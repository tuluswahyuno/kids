"use client";

import Link from "next/link";
import { useState } from "react";
import { areaInfo, summarizeByArea } from "@/engine/areas";
import { stopSpeech } from "@/engine/audio";
import { entitlementStore, FREE_MODE, useEntitlement } from "@/engine/entitlement";
import { removeProfile, useProfiles, profilesStore } from "@/engine/profiles";
import { progressStore, streakDays, summarize, totalStars, useProgress } from "@/engine/progress";
import { updateSettings, useSettings } from "@/engine/settings";
import { AccountPanel } from "./AccountPanel";
import { gameById } from "@/games/registry";

const WEEK = 7 * 24 * 3600 * 1000;

export function ParentDashboard() {
  const profiles = useProfiles();
  const progress = useProgress();
  const settings = useSettings();
  const ent = useEntitlement();
  const [confirmReset, setConfirmReset] = useState(false);
  const [since] = useState(() => Date.now() - WEEK);

  return (
    <div className="stack">
      <section className="panel stack">
        <h2>📈 Perkembangan anak</h2>
        {profiles.list.length === 0 && <p>Belum ada profil anak. Buat profil di halaman utama.</p>}
        {profiles.list.map((p) => {
          const week = summarize(progress, p.id, since);
          const plays = week.reduce((n, g) => n + g.plays, 0);
          return (
            <div key={p.id} className="stack" style={{ borderTop: "2px dashed #eadfc9", paddingTop: 10 }}>
              <div className="stat">
                <b>
                  {p.avatar} {p.name}
                </b>
                <span>
                  ⭐ {totalStars(progress, p.id)} · 🔥 {streakDays(progress, p.id)} hari beruntun
                </span>
              </div>
              <p>
                7 hari terakhir: <b>{plays}</b> kali bermain
              </p>
              {week.length === 0 && <p style={{ color: "var(--muted)" }}>Belum ada permainan minggu ini.</p>}
              {week.length > 0 && (
                <div className="stack" aria-label="Ringkasan per bidang belajar">
                  <b>Per bidang belajar</b>
                  {summarizeByArea(progress.sessions, p.id, since, (id) => gameById(id)?.area).map((a) => {
                    const info = areaInfo(a.area);
                    return (
                      <div key={a.area} className="stat">
                        <span style={{ minWidth: 150 }}>
                          {info.emoji} {info.title}
                        </span>
                        {a.plays > 0 ? (
                          <>
                            <div className="bar-track" aria-hidden>
                              <div className="bar-fill" style={{ width: `${Math.round(a.accuracy * 100)}%`, background: info.color }} />
                            </div>
                            <span style={{ minWidth: 80, textAlign: "right" }}>
                              {Math.round(a.accuracy * 100)}% · {a.plays}×
                            </span>
                          </>
                        ) : (
                          <span style={{ color: "var(--muted)" }}>belum dilatih</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {week.map((g) => (
                <div key={g.gameId} className="stat">
                  <span style={{ minWidth: 130 }}>
                    {gameById(g.gameId)?.emoji} {gameById(g.gameId)?.title ?? g.gameId}
                    <small style={{ display: "block", color: "var(--muted)" }}>{gameById(g.gameId)?.skill}</small>
                  </span>
                  <div className="bar-track" aria-hidden>
                    <div className="bar-fill" style={{ width: `${Math.round(g.accuracy * 100)}%` }} />
                  </div>
                  <span style={{ minWidth: 48, textAlign: "right" }}>{Math.round(g.accuracy * 100)}%</span>
                </div>
              ))}
              <button
                type="button"
                className="btn"
                onClick={() => {
                  if (window.confirm(`Hapus profil ${p.name} beserta riwayatnya?`)) {
                    removeProfile(p.id);
                    progressStore.set((s) => ({ sessions: s.sessions.filter((x) => x.profileId !== p.id) }));
                  }
                }}
              >
                🗑️ Hapus profil {p.name}
              </button>
            </div>
          );
        })}
      </section>

      <section className="panel stack">
        <h2>⚙️ Pengaturan</h2>
        <label className="toggle">
          <input type="checkbox" checked={settings.voice} onChange={(e) => { updateSettings({ voice: e.target.checked }); if (!e.target.checked) stopSpeech(); }} />
          🗣️ Suara pembaca
        </label>
        <label className="toggle">
          <input type="checkbox" checked={settings.music} onChange={(e) => updateSettings({ music: e.target.checked })} />
          🎵 Musik latar
        </label>
        <label className="toggle">
          <input type="checkbox" checked={settings.sfx} onChange={(e) => updateSettings({ sfx: e.target.checked })} />
          🔔 Efek bunyi
        </label>
        <label className="toggle">
          <input type="checkbox" checked={settings.text} onChange={(e) => updateSettings({ text: e.target.checked })} />
          🔤 Tampilkan tulisan di kartu
        </label>
      </section>

      <AccountPanel />

      {!FREE_MODE && (
      <section className="panel stack">
          <h2>⭐ Premium</h2>
          <p>
            Status: {ent.isPremium ? <span className="chip">Aktif</span> : <b>Gratis</b>}
          </p>
          <Link className="btn primary" href="/orang-tua/premium/">
            {ent.isPremium ? "Kelola langganan" : "Lihat paket Premium"}
          </Link>
        </section>
      )}

      <section className="panel stack">
        <h2>🔐 Data & privasi</h2>
        <p>
          Semua data bermain saat ini tersimpan <b>hanya di perangkat ini</b>. Kami tidak meminta email, foto, atau lokasi anak.
        </p>
        <Link className="btn" href="/privasi/">
          Baca kebijakan privasi
        </Link>
        {!confirmReset ? (
          <button type="button" className="btn" onClick={() => setConfirmReset(true)}>
            Hapus semua data di perangkat ini
          </button>
        ) : (
          <div className="stack">
            <p role="alert">
              <b>Yakin?</b> Semua profil dan riwayat akan hilang dan tidak bisa dikembalikan.
            </p>
            <div className="row">
              <button
                type="button"
                className="btn danger"
                onClick={() => {
                  profilesStore.set({ list: [], activeId: null });
                  progressStore.set({ sessions: [] });
                  entitlementStore.set({ premium: false, source: "none", until: null });
                  setConfirmReset(false);
                }}
              >
                Ya, hapus semua
              </button>
              <button type="button" className="btn" onClick={() => setConfirmReset(false)}>
                Batal
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
