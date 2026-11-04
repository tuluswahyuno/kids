import Link from "next/link";

export const metadata = { title: "Sedang offline" };

export default function OfflinePage() {
  return (
    <main className="page" style={{ textAlign: "center", alignItems: "center" }}>
      <div style={{ fontSize: 90 }} aria-hidden>
        📡
      </div>
      <h1 className="gametitle">Sedang tidak ada internet</h1>
      <p className="sub">Game yang sudah pernah dibuka tetap bisa dimainkan.</p>
      <Link className="btn primary xl" href="/">
        🏠 Menu
      </Link>
    </main>
  );
}
