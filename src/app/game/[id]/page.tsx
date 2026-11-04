import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameClient } from "@/components/GameClient";
import { GAMES, gameById } from "@/games/registry";

export const dynamicParams = false;

export function generateStaticParams() {
  return GAMES.map((g) => ({ id: g.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const g = gameById(id);
  return g ? { title: g.title, description: g.blurb } : {};
}

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!gameById(id)) notFound();
  return <GameClient id={id} />;
}
