"use client";

import { useCallback, useEffect, useState } from "react";
import type { Bathroom, LatLng } from "@/types/bathroom";

export function usePitStop() {
  const [bathrooms, setBathrooms] = useState<Bathroom[]>([]);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/bathrooms");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBathrooms(data.bathrooms);
    } catch {
      setError("Couldn't load pit stops. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, []);

  const addBathroom = useCallback(
    async (data: { name: string; notes: string; accessible: boolean; requiresCode: boolean; lat: number; lng: number }) => {
      setError(null);
      const res = await fetch("/api/bathrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Couldn't save that pit stop.");
        return false;
      }
      await refresh();
      return true;
    },
    [refresh]
  );

  const rateBathroom = useCallback(
    async (bathroomId: string, stars: number) => {
      setError(null);
      const res = await fetch(`/api/bathrooms/${bathroomId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stars }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Couldn't save that rating.");
        return false;
      }
      await refresh();
      return true;
    },
    [refresh]
  );

  return { bathrooms, userLocation, loading, error, addBathroom, rateBathroom, refresh };
}
