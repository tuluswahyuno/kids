import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page" style={{ textAlign: "center", alignItems: "center" }}>
      <div style={{ fontSize: 90 }} aria-hidden>
        🧭
      </div>
      <h1 className="gametitle">Ups, halaman tidak ketemu</h1>
      <Link className="btn primary xl" href="/">
        🏠 Kembali ke Menu
      </Link>
    </main>
  );
}
