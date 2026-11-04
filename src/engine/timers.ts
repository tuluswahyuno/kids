"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Timer yang otomatis dibersihkan saat komponen dilepas.
 * Mencegah kebocoran setTimeout/setInterval ketika anak menekan "keluar" di tengah game.
 */
export function useTimers() {
  const timeouts = useRef(new Set<ReturnType<typeof setTimeout>>());
  const intervals = useRef(new Set<ReturnType<typeof setInterval>>());

  const after = useCallback((ms: number, fn: () => void) => {
    const id = setTimeout(() => {
      timeouts.current.delete(id);
      fn();
    }, ms);
    timeouts.current.add(id);
    return id;
  }, []);

  const every = useCallback((ms: number, fn: () => void) => {
    const id = setInterval(fn, ms);
    intervals.current.add(id);
    return id;
  }, []);

  const clear = useCallback((id: ReturnType<typeof setTimeout> | ReturnType<typeof setInterval> | null | undefined) => {
    if (id == null) return;
    clearTimeout(id as ReturnType<typeof setTimeout>);
    clearInterval(id as ReturnType<typeof setInterval>);
    timeouts.current.delete(id as ReturnType<typeof setTimeout>);
    intervals.current.delete(id as ReturnType<typeof setInterval>);
  }, []);

  const clearAll = useCallback(() => {
    timeouts.current.forEach(clearTimeout);
    intervals.current.forEach(clearInterval);
    timeouts.current.clear();
    intervals.current.clear();
  }, []);

  useEffect(() => clearAll, [clearAll]);

  return { after, every, clear, clearAll };
}
