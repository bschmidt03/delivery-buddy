"use client";

export function PitStopFab({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 left-5 z-[1500] h-14 w-14 rounded-full bg-accent-2 text-bg text-2xl shadow-xl shadow-accent-2/30 flex items-center justify-center active:scale-95 transition-transform"
      aria-label="Open Pit Stops map"
    >
      🚻
    </button>
  );
}
