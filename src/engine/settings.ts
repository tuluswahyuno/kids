"use client";

import { createPersistentStore } from "@/lib/store";

export interface Settings {
  /** suara pembaca / bunyi hewan */
  voice: boolean;
  /** musik latar */
  music: boolean;
  /** efek bunyi (benar/salah/pletuk) */
  sfx: boolean;
  /** tampilkan tulisan di kartu/pilihan (membantu belajar membaca) */
  text: boolean;
}

export const settingsStore = createPersistentStore<Settings>("mp.settings.v1", {
  voice: true,
  music: true,
  sfx: true,
  text: true,
});

export const useSettings = () => settingsStore.use();
export const updateSettings = (patch: Partial<Settings>) =>
  settingsStore.set((s) => ({ ...s, ...patch }));
