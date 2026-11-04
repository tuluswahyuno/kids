import type { Metadata } from "next";
import Link from "next/link";
import { PremiumView } from "@/components/PremiumView";
import { ParentGate } from "@/engine/ParentGate";

export const metadata: Metadata = { title: "Premium" };

export default function PremiumPage() {
  return (
    <main className="page">
      <Link className="backlink" href="/orang-tua/">
        ← Kembali
      </Link>
      <h1 className="gametitle">⭐ Premium</h1>
      <ParentGate title="Khusus Orang Tua">
        <PremiumView />
      </ParentGate>
    </main>
  );
}
