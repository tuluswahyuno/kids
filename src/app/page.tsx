import Link from "next/link";
import { DailyMission } from "@/components/DailyMission";
import { ProfileBar } from "@/components/ProfileBar";
import { AREAS } from "@/engine/areas";
import { GAMES } from "@/games/registry";

export default function Home() {
  return (
    <main className="page">
      <h1 className="gametitle">🎮 Ayo Belajar & Bermain!</h1>

      <ProfileBar />
      <DailyMission />

      {AREAS.map((area) => {
        const games = GAMES.filter((g) => g.area === area.id);
        if (games.length === 0) return null;
        return (
          <section key={area.id} className="area" aria-labelledby={`area-${area.id}`} style={{ ["--accent" as string]: area.color }}>
            <div className="area-head">
              <span className="area-emoji" aria-hidden>
                {area.emoji}
              </span>
              <div>
                <h2 id={`area-${area.id}`}>{area.title}</h2>
                <p>{area.blurb}</p>
              </div>
            </div>
            <div className="gamegrid">
              {games.map((g) => (
                <Link
                  key={g.id}
                  href={`/game/${g.id}/`}
                  className="gamecard"
                  style={{ background: g.soft, ["--accent" as string]: g.color }}
                >
                  <span className="gc-emoji" aria-hidden>
                    {g.emoji}
                  </span>
                  <span>
                    <b>{g.title}</b>
                    <small>{g.blurb}</small>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      <nav className="footnav" aria-label="Lainnya">
        <Link href="/orang-tua/">👨‍👩‍👧 Untuk Orang Tua</Link>
        <Link href="/privasi/">🔐 Privasi</Link>
      </nav>
    </main>
  );
}
