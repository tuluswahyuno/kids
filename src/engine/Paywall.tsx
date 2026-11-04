"use client";

import Link from "next/link";
import { DEV_UNLOCK_ENABLED, devSetPremium } from "./entitlement";

/**
 * Dialog saat anak menyentuh fitur premium.
 * Anak TIDAK boleh bisa membeli sendiri: tombol beli mengarah ke halaman orang tua
 * yang dilindungi ParentGate (syarat kebijakan Play Store untuk aplikasi anak).
 */
export function Paywall({ onClose }: { onClose: () => void }) {
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="pw-title" onClick={onClose}>
      <div className="panel dialog" onClick={(e) => e.stopPropagation()}>
        <div className="big-emoji">🔒</div>
        <h2 id="pw-title">Tingkat ini khusus Premium</h2>
        <p>Minta orang tua untuk membuka semua tingkat, tema, dan game baru.</p>
        <Link className="btn primary xl" href="/orang-tua/premium/">
          👨‍👩‍👧 Untuk Orang Tua
        </Link>
        {DEV_UNLOCK_ENABLED && (
          <button className="btn" type="button" onClick={() => { devSetPremium(true); onClose(); }}>
            🧪 Buka premium (mode pengembang)
          </button>
        )}
        <button className="btn" type="button" onClick={onClose}>
          Nanti saja
        </button>
      </div>
    </div>
  );
}
