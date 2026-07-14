"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { usePitStop } from "@/hooks/usePitStop";
import { distanceInMiles } from "@/lib/geo";
import { AddBathroomForm } from "@/components/AddBathroomForm";
import { RatingStars } from "@/components/RatingStars";
import type { Bathroom, LatLng } from "@/types/bathroom";

const PitStopMap = dynamic(() => import("@/components/PitStopMap").then((m) => m.PitStopMap), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center text-muted text-sm">
      Loading map...
    </div>
  ),
});

export function PitStopSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { bathrooms, userLocation, loading, error, addBathroom, rateBathroom } = usePitStop();
  const [addMode, setAddMode] = useState(false);
  const [pendingPin, setPendingPin] = useState<LatLng | null>(null);
  const [flyToTarget, setFlyToTarget] = useState<LatLng | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ratingId, setRatingId] = useState<string | null>(null);

  const sortedBathrooms = useMemo(() => {
    if (!userLocation) return bathrooms;
    return [...bathrooms].sort(
      (a, b) =>
        distanceInMiles(userLocation, { lat: a.lat, lng: a.lng }) -
        distanceInMiles(userLocation, { lat: b.lat, lng: b.lng })
    );
  }, [bathrooms, userLocation]);

  if (!open) return null;

  function handleMapClick(pos: LatLng) {
    if (!addMode) return;
    setPendingPin(pos);
  }

  async function handleFormSubmit(data: { name: string; notes: string; accessible: boolean; requiresCode: boolean }) {
    if (!pendingPin) return;
    setSubmitting(true);
    const ok = await addBathroom({ ...data, lat: pendingPin.lat, lng: pendingPin.lng });
    setSubmitting(false);
    if (ok) {
      setPendingPin(null);
      setAddMode(false);
    }
  }

  async function handleRate(bathroom: Bathroom, stars: number) {
    setRatingId(bathroom.id);
    await rateBathroom(bathroom.id, stars);
    setRatingId(null);
  }

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-surface rounded-t-3xl border-t border-x border-accent-2/30 flex flex-col h-[92vh] shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-accent-2/15 flex items-center justify-center text-lg">
              🚻
            </div>
            <div>
              <p className="font-semibold leading-tight">Pit Stops</p>
              <p className="text-xs text-muted leading-tight">Crowdsourced by drivers like you</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-surface-2 flex items-center justify-center text-muted"
            aria-label="Close pit stops"
          >
            ✕
          </button>
        </div>

        {error && <p className="text-bad text-xs text-center px-4 pt-2">{error}</p>}

        <div className="relative flex-[3] min-h-[38vh] border-b border-border">
          <PitStopMap
            bathrooms={bathrooms}
            userLocation={userLocation}
            addMode={addMode}
            onMapClick={handleMapClick}
            pendingPin={pendingPin}
            flyToTarget={flyToTarget}
            renderPopup={(b) => (
              <div className="min-w-[180px] flex flex-col gap-1.5">
                <p className="font-semibold text-sm">{b.name}</p>
                {b.notes && <p className="text-xs text-muted">{b.notes}</p>}
                <div className="flex gap-1 flex-wrap text-xs">
                  {b.accessible && (
                    <span className="rounded-full bg-buddy/15 text-buddy px-2 py-0.5">♿ Accessible</span>
                  )}
                  {b.requiresCode && (
                    <span className="rounded-full bg-accent/15 text-accent px-2 py-0.5">🔑 Needs code</span>
                  )}
                </div>
                <p className="text-xs text-accent-2">
                  {b.averageRating ? `★ ${b.averageRating.toFixed(1)} (${b.ratingCount})` : "No ratings yet"}
                </p>
                <div className="pt-1">
                  <RatingStars disabled={ratingId === b.id} onRate={(stars) => handleRate(b, stars)} />
                </div>
              </div>
            )}
          />

          <button
            onClick={() => {
              setAddMode((v) => !v);
              setPendingPin(null);
            }}
            className={`absolute top-3 right-3 z-[900] rounded-full px-4 py-2 text-sm font-semibold shadow-lg active:scale-95 transition-transform ${
              addMode ? "bg-bad text-bg" : "bg-accent-2 text-bg"
            }`}
          >
            {addMode ? "Cancel" : "+ Drop pin"}
          </button>

          {addMode && !pendingPin && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[900] rounded-full bg-bg/90 border border-accent-2/40 px-4 py-1.5 text-xs text-accent-2 font-medium animate-fade-in">
              Tap the map where it&apos;s located
            </div>
          )}

          {addMode && pendingPin && (
            <AddBathroomForm
              submitting={submitting}
              onCancel={() => setPendingPin(null)}
              onSubmit={handleFormSubmit}
            />
          )}
        </div>

        <ul className="flex-1 overflow-y-auto">
          {loading && <li className="p-4 text-sm text-muted text-center">Loading pit stops...</li>}
          {!loading && sortedBathrooms.length === 0 && (
            <li className="p-4 text-sm text-muted text-center">
              No pit stops nearby yet — be the first to drop one 📍
            </li>
          )}
          {sortedBathrooms.map((b) => (
            <li
              key={b.id}
              onClick={() => setFlyToTarget({ lat: b.lat, lng: b.lng })}
              className="px-4 py-3 border-b border-border/60 border-l-2 border-l-accent-2/50 cursor-pointer active:bg-surface-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm">{b.name}</span>
                {userLocation && (
                  <span className="text-xs text-muted shrink-0 tabular">
                    {distanceInMiles(userLocation, { lat: b.lat, lng: b.lng }).toFixed(1)} mi
                  </span>
                )}
              </div>
              <div className="text-xs text-accent-2 mt-0.5">
                {b.averageRating ? `★ ${b.averageRating.toFixed(1)} (${b.ratingCount})` : "No ratings yet"}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
