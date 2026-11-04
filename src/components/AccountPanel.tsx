"use client";

import { useEffect, useState } from "react";
import { deleteAccount, initAccount, sendCode, signOut, syncNow, useAccount, verifyCode } from "@/engine/account";

/** Login orang tua + sinkronisasi. Tersembunyi bila Supabase belum dikonfigurasi. */
export function AccountPanel() {
  const a = useAccount();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  useEffect(() => initAccount(), []);

  if (a.status === "off") return null;

  return (
    <section className="panel stack">
      <h2>☁️ Akun orang tua & cadangan</h2>
      {a.status === "loading" && <p>Memuat…</p>}

      {a.status === "signedout" && (
        <>
          <p>
            Masuk untuk mencadangkan perkembangan dan memakai Premium di perangkat lain. <b>Wajib orang tua</b> yang mendaftar; anak
            tidak membuat akun. Yang dikirim hanya nama panggilan, avatar, dan skor permainan.
          </p>
          <label className="stack">
            Email orang tua
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" />
          </label>
          {!sent ? (
            <button type="button" className="btn primary" disabled={a.busy || !email.includes("@")} onClick={async () => setSent(await sendCode(email))}>
              Kirim kode masuk
            </button>
          ) : (
            <>
              <label className="stack">
                Kode dari email
                <input inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value)} />
              </label>
              <button type="button" className="btn primary" disabled={a.busy || code.trim().length < 6} onClick={() => verifyCode(email, code)}>
                Masuk
              </button>
            </>
          )}
        </>
      )}

      {a.status === "signedin" && (
        <>
          <p>
            Masuk sebagai <b>{a.email}</b>
            {a.lastSync && <> · sinkron terakhir {new Date(a.lastSync).toLocaleTimeString("id-ID")}</>}
          </p>
          <div className="row">
            <button type="button" className="btn primary" disabled={a.busy} onClick={() => syncNow()}>
              {a.busy ? "Menyinkronkan…" : "Sinkronkan sekarang"}
            </button>
            <button type="button" className="btn" disabled={a.busy} onClick={() => signOut()}>
              Keluar
            </button>
          </div>
          {!confirmDel ? (
            <button type="button" className="btn" onClick={() => setConfirmDel(true)}>
              Hapus akun & data di server
            </button>
          ) : (
            <div className="stack">
              <p><b>Ini permanen.</b> Akun, profil anak, dan seluruh skor di server akan dihapus.</p>
              <button type="button" className="btn danger" disabled={a.busy} onClick={async () => { await deleteAccount(); setConfirmDel(false); }}>
                Ya, hapus permanen
              </button>
              <button type="button" className="btn" onClick={() => setConfirmDel(false)}>Batal</button>
            </div>
          )}
        </>
      )}

      {a.message && <p role="status">{a.message}</p>}
    </section>
  );
}
