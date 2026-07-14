"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Clock, Globe, KeyRound, MapPin, MapPinPlus, Star, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { usePitStop } from "@/hooks/usePitStop";
import { useOsmRestrooms } from "@/hooks/useOsmRestrooms";
import { distanceInMiles } from "@/lib/geo";
import { AddBathroomForm } from "@/components/AddBathroomForm";
import { RatingStars } from "@/components/RatingStars";
import type { Bathroom, LatLng, OsmRestroom } from "@/types/bathroom";

// Hide a community pin when a driver pin already exists this close to it.
const DEDUPE_MILES = 0.03;

const PitStopMap = dynamic(() => import("@/components/PitStopMap").then((m) => m.PitStopMap), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
      Loading map...
    </div>
  ),
});

function RatingLine({ bathroom }: { bathroom: Bathroom }) {
  if (!bathroom.averageRating) {
    return <span className="text-xs text-muted-foreground">No ratings yet</span>;
  }
  return (
    <span className="flex items-center gap-1 text-xs text-accent-2">
      <Star className="h-3 w-3 fill-accent-2" />
      {bathroom.averageRating.toFixed(1)}
      <span className="text-muted-foreground">({bathroom.ratingCount})</span>
    </span>
  );
}

export function PitStopSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { bathrooms, userLocation, loading, error, addBathroom, rateBathroom } = usePitStop();
  const { osmRestrooms, onBoundsChange } = useOsmRestrooms();
  const [addMode, setAddMode] = useState(false);
  const [pendingPin, setPendingPin] = useState<LatLng | null>(null);
  const [flyToTarget, setFlyToTarget] = useState<LatLng | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ratingId, setRatingId] = useState<string | null>(null);
  const [savingOsmId, setSavingOsmId] = useState<string | null>(null);

  const sortedBathrooms = useMemo(() => {
    if (!userLocation) return bathrooms;
    return [...bathrooms].sort(
      (a, b) =>
        distanceInMiles(userLocation, { lat: a.lat, lng: a.lng }) -
        distanceInMiles(userLocation, { lat: b.lat, lng: b.lng })
    );
  }, [bathrooms, userLocation]);

  const visibleOsmRestrooms = useMemo(
    () =>
      osmRestrooms.filter((r) =>
        bathrooms.every(
          (b) => distanceInMiles({ lat: r.lat, lng: r.lng }, { lat: b.lat, lng: b.lng }) > DEDUPE_MILES
        )
      ),
    [osmRestrooms, bathrooms]
  );

  async function handleSaveOsm(r: OsmRestroom) {
    setSavingOsmId(r.id);
    const noteParts = [];
    if (r.fee) noteParts.push("Fee required");
    if (r.openingHours) noteParts.push(`Hours: ${r.openingHours}`);
    noteParts.push("Imported from OpenStreetMap");
    await addBathroom({
      name: r.name,
      notes: noteParts.join(" · ").slice(0, 500),
      accessible: r.accessible,
      requiresCode: false,
      lat: r.lat,
      lng: r.lng,
    });
    setSavingOsmId(null);
  }

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
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="left"
        className="w-[90vw] max-w-[380px] rounded-r-3xl border-r border-y border-accent-2/25 bg-surface gap-0 p-0"
      >
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-accent-2/25 to-accent-2/5 ring-1 ring-accent-2/30 flex items-center justify-center">
            <MapPin className="h-4.5 w-4.5 text-accent-2" strokeWidth={2.25} />
          </div>
          <div>
            <SheetTitle className="font-semibold leading-tight text-base">
              Pit Stops
            </SheetTitle>
            <p className="text-xs text-muted-foreground leading-tight">
              Crowdsourced by drivers like you
            </p>
          </div>
        </div>

        {error && <p className="text-bad text-xs text-center px-4 pt-2">{error}</p>}

        <div className="relative flex-[3] min-h-[38vh] border-b border-border">
          <PitStopMap
            bathrooms={bathrooms}
            osmRestrooms={visibleOsmRestrooms}
            userLocation={userLocation}
            addMode={addMode}
            onMapClick={handleMapClick}
            onBoundsChange={onBoundsChange}
            pendingPin={pendingPin}
            flyToTarget={flyToTarget}
            renderOsmPopup={(r) => (
              <div className="min-w-[180px] flex flex-col gap-1.5">
                <p className="font-semibold text-sm">{r.name}</p>
                <div className="flex gap-1 flex-wrap">
                  {r.accessible && (
                    <Badge className="rounded-full bg-buddy/15 text-buddy border-0">
                      ♿ Accessible
                    </Badge>
                  )}
                  {r.fee && (
                    <Badge className="rounded-full bg-primary/15 text-primary border-0">
                      Fee
                    </Badge>
                  )}
                </div>
                {r.openingHours && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 shrink-0" /> {r.openingHours}
                  </p>
                )}
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Globe className="h-3 w-3 shrink-0" /> Community data · OpenStreetMap
                </p>
                <button
                  onClick={() => handleSaveOsm(r)}
                  disabled={savingOsmId === r.id}
                  className="mt-1 rounded-lg bg-gradient-to-br from-accent-2 to-amber-600 text-bg px-3 py-1.5 text-xs font-semibold ring-1 ring-white/15 active:scale-[0.97] transition-transform disabled:opacity-50"
                >
                  {savingOsmId === r.id ? "Saving..." : "Save to Pit Stops"}
                </button>
              </div>
            )}
            renderPopup={(b) => (
              <div className="min-w-[180px] flex flex-col gap-1.5">
                <p className="font-semibold text-sm">{b.name}</p>
                {b.notes && <p className="text-xs text-muted-foreground">{b.notes}</p>}
                <div className="flex gap-1 flex-wrap">
                  {b.accessible && (
                    <Badge className="rounded-full bg-buddy/15 text-buddy border-0">
                      ♿ Accessible
                    </Badge>
                  )}
                  {b.requiresCode && (
                    <Badge className="rounded-full bg-primary/15 text-primary border-0 gap-1">
                      <KeyRound className="h-3 w-3" /> Needs code
                    </Badge>
                  )}
                </div>
                <RatingLine bathroom={b} />
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
            className={`absolute top-3 right-3 z-[900] flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold shadow-lg ring-1 ring-white/15 active:scale-95 transition-transform ${
              addMode
                ? "bg-bad text-bg"
                : "bg-gradient-to-br from-accent-2 to-amber-600 text-bg"
            }`}
          >
            {addMode ? (
              <>
                <X className="h-4 w-4" /> Cancel
              </>
            ) : (
              <>
                <MapPinPlus className="h-4 w-4" /> Drop pin
              </>
            )}
          </button>

          {addMode && !pendingPin && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[900] rounded-full bg-bg/90 backdrop-blur border border-accent-2/40 px-4 py-1.5 text-xs text-accent-2 font-medium animate-fade-in whitespace-nowrap">
              Tap the map where it&apos;s located
            </div>
          )}

          {!addMode && visibleOsmRestrooms.length > 0 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[900] flex items-center gap-1.5 rounded-full bg-bg/90 backdrop-blur border border-border px-3.5 py-1.5 text-xs text-muted-foreground font-medium animate-fade-in whitespace-nowrap">
              <span className="inline-block h-3 w-3 rounded-full border border-dashed border-accent-2/70" />
              {visibleOsmRestrooms.length} community restroom
              {visibleOsmRestrooms.length === 1 ? "" : "s"} nearby
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
          {loading && (
            <li className="p-4 text-sm text-muted-foreground text-center">
              Loading pit stops...
            </li>
          )}
          {!loading && sortedBathrooms.length === 0 && (
            <li className="p-4 text-sm text-muted-foreground text-center">
              No pit stops nearby yet — be the first to drop one
            </li>
          )}
          {sortedBathrooms.map((b) => (
            <li
              key={b.id}
              onClick={() => setFlyToTarget({ lat: b.lat, lng: b.lng })}
              className="px-4 py-3 border-b border-border/60 border-l-2 border-l-accent-2/50 cursor-pointer active:bg-secondary transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm">{b.name}</span>
                {userLocation && (
                  <span className="text-xs text-muted-foreground shrink-0 tabular">
                    {distanceInMiles(userLocation, { lat: b.lat, lng: b.lng }).toFixed(1)} mi
                  </span>
                )}
              </div>
              <div className="mt-0.5">
                <RatingLine bathroom={b} />
              </div>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
