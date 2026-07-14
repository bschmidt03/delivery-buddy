"use client";

import { MessageCircle } from "lucide-react";

export function ChatFab({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-5 z-40 h-14 w-14 rounded-full bg-gradient-to-br from-buddy to-cyan-600 text-bg shadow-xl shadow-buddy/25 ring-1 ring-white/15 flex items-center justify-center active:scale-95 transition-transform"
      aria-label="Open Buddy chat"
    >
      <MessageCircle className="h-6 w-6" strokeWidth={2.25} />
    </button>
  );
}
