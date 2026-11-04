"use client";

import { useState } from "react";
import { FREE_MODE, useEntitlement } from "@/engine/entitlement";
import { getBilling, PLANS } from "@/lib/billing";

const BENEFITS = [
  "Semua tingkat kesulitan (Sulit & Ahli)",
  "Semua game, termasuk game baru setiap bulan",
  "Laporan perkembangan anak untuk orang tua",
  "Tanpa iklan — selalu aman untuk anak",
];

function FreeNotice() {
  return (
    <section className="panel stack">
      <h2>🎁 Semua gratis</h2>
      <p>Saat ini semua game dan tingkat kesulitan terbuka gratis, tanpa iklan.</p>
    </section>
  );
}

export const PremiumView = () => (FREE_MODE ? <FreeNotice /> : <PaidView />);

function PaidView() {
  const ent = useEntitlement();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  async function run(kind: "buy" | "restore", planId?: string) {
    setBusy(planId ?? kind);
    setMsg("");
    const b = getBilling();
    const r = kind === "buy" ? await b.purchase(planId!) : await b.restore();
    setBusy(null);
    setMsg(r.ok ? "Terima kasih! Premium sudah aktif 🎉" : r.message);
  }

  return (
    <div className="stack">
      <section className="panel stack">
        <h2>⭐ Main Pintar Premium</h2>
        <ul>
          {BENEFITS.map((b) => (
            <li key={b}>✅ {b}</li>
          ))}
        </ul>
        {ent.isPremium && <p><span className="chip">Premium aktif</span></p>}
      </section>

      {!ent.isPremium && (
        <div className="plans">
          {PLANS.map((p) => (
            <div key={p.id} className="panel plan">
              {p.badge ? <span className="chip">{p.badge}</span> : <span style={{ height: 24 }} />}
              <b>{p.name}</b>
              <div className="price">{p.priceLabel}</div>
              <small style={{ color: "var(--muted)" }}>{p.period}</small>
              <button type="button" className="btn primary" disabled={busy !== null} onClick={() => run("buy", p.id)}>
                {busy === p.id ? "Memproses…" : "Pilih"}
              </button>
            </div>
          ))}
        </div>
      )}

      <p role="status" aria-live="polite" style={{ textAlign: "center", fontWeight: 700 }}>
        {msg}
      </p>
      <button type="button" className="btn" disabled={busy !== null} onClick={() => run("restore")}>
        🔄 Pulihkan pembelian
      </button>
      <p className="sub" style={{ fontSize: "0.85em" }}>
        Harga di atas hanya contoh. Pembayaran dikelola Google Play (Android) atau penyedia pembayaran web. Langganan bisa dibatalkan kapan saja.
      </p>
    </div>
  );
}
