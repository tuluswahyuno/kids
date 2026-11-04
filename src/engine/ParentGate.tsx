"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";

/**
 * Pelindung orang tua (wajib untuk aplikasi anak: pembelian, pengaturan, data).
 * Soal perkalian dua angka: anak usia TK tidak akan bisa menjawabnya.
 * Lolos hanya berlaku selama halaman terbuka (tidak disimpan).
 */
function makeQuestion() {
  const a = 6 + Math.floor(Math.random() * 7); // 6–12
  const b = 6 + Math.floor(Math.random() * 7);
  return { a, b, answer: a * b };
}

const noopSubscribe = () => () => {};

/**
 * Soal diacak, jadi HANYA dirender di klien. Menghindari ketidakcocokan hidrasi
 * (server tidak boleh menghasilkan angka acak yang berbeda dari klien).
 */
export function ParentGate(props: { children: ReactNode; title?: string }) {
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  if (!mounted) return <div className="panel gate" aria-busy="true" style={{ minHeight: 260 }} />;
  return <Gate {...props} />;
}

function Gate({ children, title = "Khusus Orang Tua" }: { children: ReactNode; title?: string }) {
  const [ok, setOk] = useState(false);
  const [q, setQ] = useState(makeQuestion);
  const [val, setVal] = useState("");
  const [err, setErr] = useState(false);

  if (ok) return <>{children}</>;

  return (
    <form
      className="panel gate"
      onSubmit={(e) => {
        e.preventDefault();
        if (Number(val) === q.answer) setOk(true);
        else {
          setErr(true);
          setVal("");
          setQ(makeQuestion());
        }
      }}
    >
      <h2>🔒 {title}</h2>
      <p>Untuk masuk, jawab soal ini:</p>
      <div className="gateq">
        {q.a} × {q.b} = ?
      </div>
      <input
        className="gateinput"
        inputMode="numeric"
        pattern="[0-9]*"
        autoFocus
        value={val}
        onChange={(e) => {
          setVal(e.target.value.replace(/\D/g, ""));
          setErr(false);
        }}
        aria-label="Jawaban"
      />
      {err && <p role="alert" className="error">Belum tepat, coba soal baru.</p>}
      <button className="btn primary xl" type="submit" disabled={!val}>
        Masuk
      </button>
    </form>
  );
}
