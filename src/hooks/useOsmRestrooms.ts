"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MapBounds, OsmRestroom } from "@/types/bathroom";

// Matches the server's guard; skip fetching when zoomed out past it.
const MAX_BBOX_DEGREES = 0.5;
const DEBOUNCE_MS = 600;

export function useOsmRestrooms() {
  const [osmRestrooms, setOsmRestrooms] = useState<OsmRestroom[]>([]);
  const [osmLoading, setOsmLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const onBoundsChange = useCallback((bounds: MapBounds) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (
      bounds.north - bounds.south > MAX_BBOX_DEGREES ||
      bounds.east - bounds.west > MAX_BBOX_DEGREES
    ) {
      setOsmRestrooms([]);
      lastKeyRef.current = null;
      return;
    }

    const key = [bounds.south, bounds.west, bounds.north, bounds.east]
      .map((n) => n.toFixed(2))
      .join(",");
    if (key === lastKeyRef.current) return;

    timerRef.current = setTimeout(async () => {
      lastKeyRef.current = key;
      setOsmLoading(true);
      try {
        const qs = new URLSearchParams({
          south: String(bounds.south),
          west: String(bounds.west),
          north: String(bounds.north),
          east: String(bounds.east),
        });
        const res = await fetch(`/api/restrooms/nearby?${qs}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setOsmRestrooms(data.restrooms ?? []);
      } catch {
        // Community pins are best-effort; keep whatever we had.
        lastKeyRef.current = null;
      } finally {
        setOsmLoading(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  return { osmRestrooms, osmLoading, onBoundsChange };
}
