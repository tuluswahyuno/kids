"use client";

import { useSyncExternalStore } from "react";

/**
 * Store kecil yang tersimpan di localStorage dan reaktif di React.
 * - Aman untuk SSR / static export: server selalu memakai nilai awal.
 * - Aman jika localStorage diblokir (mode privat, dsb).
 */
export interface PersistentStore<T> {
  get(): T;
  set(next: T | ((prev: T) => T)): void;
  subscribe(fn: () => void): () => void;
}

export function createPersistentStore<T>(key: string, initial: T): PersistentStore<T> & { use(): T } {
  let cache: T = initial;
  let loaded = false;
  const listeners = new Set<() => void>();

  function load() {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      cache = Array.isArray(initial) ? (parsed as T) : ({ ...initial, ...parsed } as T);
    } catch {
      /* data rusak -> pakai nilai awal */
    }
  }

  const store = {
    get(): T {
      load();
      return cache;
    },
    set(next: T | ((prev: T) => T)) {
      load();
      cache = typeof next === "function" ? (next as (p: T) => T)(cache) : next;
      try {
        window.localStorage.setItem(key, JSON.stringify(cache));
      } catch {
        /* penyimpanan penuh / diblokir */
      }
      listeners.forEach((l) => l());
    },
    subscribe(fn: () => void) {
      listeners.add(fn);
      const onStorage = (e: StorageEvent) => {
        if (e.key === key) {
          loaded = false;
          load();
          fn();
        }
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(fn);
        window.removeEventListener("storage", onStorage);
      };
    },
    use(): T {
      return useSyncExternalStore(store.subscribe, store.get, () => initial);
    },
  };
  return store;
}
