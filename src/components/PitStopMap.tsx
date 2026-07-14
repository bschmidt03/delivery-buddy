"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import type { Bathroom, LatLng } from "@/types/bathroom";

function bathroomIcon(topRated: boolean) {
  return new L.DivIcon({
    className: "",
    html: `
      <div class="relative flex items-center justify-center h-9 w-9 -translate-y-1">
        ${topRated ? '<div class="absolute inset-0 rounded-full bg-accent-2/40 blur-[6px]"></div>' : ""}
        <div class="relative flex items-center justify-center h-8 w-8 rounded-full ${
          topRated ? "bg-accent-2" : "bg-surface-2 border border-accent-2/60"
        } shadow-lg shadow-black/40 text-base">
          🚻
        </div>
        <div class="absolute -bottom-1 h-2 w-2 rotate-45 ${topRated ? "bg-accent-2" : "bg-surface-2"}"></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 30],
    popupAnchor: [0, -30],
  });
}

const pendingIcon = new L.DivIcon({
  className: "",
  html: `
    <div class="relative flex items-center justify-center h-9 w-9 -translate-y-1">
      <div class="absolute h-8 w-8 rounded-full border-2 border-dashed border-accent animate-[spin_6s_linear_infinite]"></div>
      <div class="h-3 w-3 rounded-full bg-accent shadow-lg shadow-accent/50"></div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const userIcon = new L.DivIcon({
  className: "",
  html: `
    <div class="relative flex items-center justify-center h-6 w-6">
      <div class="absolute h-3 w-3 rounded-full bg-buddy animate-ping-slow"></div>
      <div class="relative h-3 w-3 rounded-full bg-buddy border-2 border-bg shadow-lg shadow-buddy/50"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function ClickHandler({ active, onClick }: { active: boolean; onClick: (pos: LatLng) => void }) {
  useMapEvents({
    click(e) {
      if (active) onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function FlyTo({ target }: { target: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 16);
  }, [target, map]);
  return null;
}

export function PitStopMap({
  bathrooms,
  userLocation,
  addMode,
  onMapClick,
  pendingPin,
  flyToTarget,
  renderPopup,
}: {
  bathrooms: Bathroom[];
  userLocation: LatLng | null;
  addMode: boolean;
  onMapClick: (pos: LatLng) => void;
  pendingPin: LatLng | null;
  flyToTarget: LatLng | null;
  renderPopup: (bathroom: Bathroom) => React.ReactNode;
}) {
  const center = userLocation ?? { lat: 39.8283, lng: -98.5795 };
  const zoom = userLocation ? 14 : 4;

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      className={`h-full w-full ${addMode ? "cursor-crosshair" : ""}`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
      />
      <ClickHandler active={addMode} onClick={onMapClick} />
      <FlyTo target={flyToTarget} />

      {userLocation && <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} />}

      {bathrooms.map((b) => (
        <Marker
          key={b.id}
          position={[b.lat, b.lng]}
          icon={bathroomIcon((b.averageRating ?? 0) >= 4.5)}
        >
          <Popup>{renderPopup(b)}</Popup>
        </Marker>
      ))}

      {pendingPin && <Marker position={[pendingPin.lat, pendingPin.lng]} icon={pendingIcon} />}
    </MapContainer>
  );
}
