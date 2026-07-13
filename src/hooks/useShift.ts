"use client";

import { useCallback, useEffect, useState } from "react";
import { appendToHistory, loadCurrentShift, saveCurrentShift } from "@/lib/storage";
import { isPaused, newShift, type Shift } from "@/lib/shift";

export function useShift() {
  const [shift, setShift] = useState<Shift | null>(null);
  const [justEnded, setJustEnded] = useState<Shift | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Reading localStorage must happen post-hydration to avoid an SSR mismatch,
    // so this one-time sync-on-mount is intentional rather than derivable from props.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShift(loadCurrentShift());
    setHydrated(true);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveCurrentShift(shift);
  }, [shift, hydrated]);

  const startShift = useCallback(
    (opts: { startTime: number; totalStopsAssigned: number; targetPace: number | null }) => {
      setShift(newShift(opts));
    },
    []
  );

  const addStops = useCallback((delta: number) => {
    setShift((prev) => {
      if (!prev) return prev;
      const completedStops = Math.max(0, prev.completedStops + delta);
      return {
        ...prev,
        completedStops,
        events: [...prev.events, { timestamp: Date.now(), delta }],
      };
    });
  }, []);

  const setCompletedStops = useCallback((value: number) => {
    setShift((prev) => {
      if (!prev) return prev;
      const clamped = Math.max(0, value);
      const delta = clamped - prev.completedStops;
      if (delta === 0) return prev;
      return {
        ...prev,
        completedStops: clamped,
        events: [...prev.events, { timestamp: Date.now(), delta }],
      };
    });
  }, []);

  const togglePause = useCallback(() => {
    setShift((prev) => {
      if (!prev) return prev;
      const paused = isPaused(prev);
      const ts = Date.now();
      if (paused) {
        const pauses = [...prev.pauses];
        pauses[pauses.length - 1] = { ...pauses[pauses.length - 1], end: ts };
        return { ...prev, pauses };
      }
      return { ...prev, pauses: [...prev.pauses, { start: ts, end: null }] };
    });
  }, []);

  const endShift = useCallback(() => {
    setShift((prev) => {
      if (!prev) return prev;
      const ts = Date.now();
      const pauses = isPaused(prev)
        ? (() => {
            const p = [...prev.pauses];
            p[p.length - 1] = { ...p[p.length - 1], end: ts };
            return p;
          })()
        : prev.pauses;
      const finished: Shift = { ...prev, endTime: ts, pauses };
      appendToHistory(finished);
      setJustEnded(finished);
      return null;
    });
  }, []);

  const discardShift = useCallback(() => {
    setShift(null);
  }, []);

  const dismissSummary = useCallback(() => {
    setJustEnded(null);
  }, []);

  return {
    shift,
    justEnded,
    now,
    hydrated,
    startShift,
    addStops,
    setCompletedStops,
    togglePause,
    endShift,
    discardShift,
    dismissSummary,
  };
}
