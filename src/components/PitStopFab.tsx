"use client";

import { MapPin } from "lucide-react";

export function PitStopFab({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-5 z-40 h-14 w-14 rounded-full bg-gradient-to-br from-accent-2 to-amber-600 text-bg shadow-xl shadow-accent-2/25 ring-1 ring-white/15 flex items-center justify-center active:scale-95 transition-transform"
      aria-label="Open Pit Stops map"
    >
      <MapPin className="h-6 w-6" strokeWidth={2.25} />
    </button>
  );
}
