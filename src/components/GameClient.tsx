"use client";

import { GameRunner } from "@/engine/GameRunner";
import { gameById } from "@/games/registry";

/** Jembatan server -> client: definisi game berisi komponen, jadi dicari di sisi klien lewat id. */
export function GameClient({ id }: { id: string }) {
  const def = gameById(id);
  if (!def) return <p className="page">Game tidak ditemukan.</p>;
  return <GameRunner def={def} />;
}
