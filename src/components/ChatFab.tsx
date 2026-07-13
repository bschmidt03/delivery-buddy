"use client";

export function ChatFab({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-5 z-[1500] h-14 w-14 rounded-full bg-buddy text-bg text-2xl shadow-xl shadow-buddy/30 flex items-center justify-center active:scale-95 transition-transform"
      aria-label="Open Buddy chat"
    >
      🎧
    </button>
  );
}
