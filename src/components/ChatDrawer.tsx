"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";
import type { ShiftContext } from "@/lib/chatContext";

const SUGGESTIONS = [
  "How am I doing right now?",
  "Help me plan my remaining stops",
  "I need a quick pep talk",
];

export function ChatDrawer({
  open,
  onClose,
  getContext,
}: {
  open: boolean;
  onClose: () => void;
  getContext: () => ShiftContext;
}) {
  const { messages, sending, error, send } = useChat(getContext);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  if (!open) return null;

  function handleSend(text: string) {
    setInput("");
    send(text);
  }

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-surface rounded-t-3xl border-t border-x border-buddy/30 flex flex-col h-[82vh] shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-buddy/15 flex items-center justify-center text-lg">
              🎧
            </div>
            <div>
              <p className="font-semibold leading-tight">Buddy</p>
              <p className="text-xs text-muted leading-tight">Route tips &amp; pace check-ins</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-surface-2 flex items-center justify-center text-muted"
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {messages.length === 0 && (
            <div className="flex flex-col gap-2 mt-4">
              <p className="text-sm text-muted text-center mb-2">
                Ask about your route, pace, or just check in.
              </p>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-left rounded-xl bg-surface-2 border border-border px-4 py-3 text-sm active:bg-border"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "self-end bg-accent text-bg"
                  : "self-start bg-surface-2 border border-buddy/20"
              }`}
            >
              {m.content || (sending && i === messages.length - 1 ? "…" : "")}
            </div>
          ))}

          {error && <p className="text-bad text-xs text-center">{error}</p>}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2 px-4 py-3 border-t border-border"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Talk to Buddy..."
            disabled={sending}
            className="flex-1 rounded-full bg-surface-2 border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-buddy disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="h-10 w-10 shrink-0 rounded-full bg-buddy text-bg flex items-center justify-center disabled:opacity-30"
            aria-label="Send"
          >
            ↑
          </button>
        </form>
      </div>
    </div>
  );
}
