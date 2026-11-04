import type { Metadata } from "next";
import Link from "next/link";
import { ParentDashboard } from "@/components/ParentDashboard";
import { ParentGate } from "@/engine/ParentGate";

export const metadata: Metadata = { title: "Untuk Orang Tua" };

export default function ParentPage() {
  return (
    <main className="page">
      <Link className="backlink" href="/">
        ← Kembali
      </Link>
      <h1 className="gametitle">👨‍👩‍👧 Untuk Orang Tua</h1>
      <ParentGate>
        <ParentDashboard />
      </ParentGate>
    </main>
  );
}
