"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, MessageCircle, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
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

  function handleSend(text: string) {
    setInput("");
    send(text);
  }

  const lastMessage = messages[messages.length - 1];
  const awaitingReply =
    sending && (!lastMessage || lastMessage.role === "user" || !lastMessage.content);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="bottom"
        className="h-[85vh] rounded-t-3xl border-t border-x border-buddy/25 bg-surface gap-0 p-0"
      >
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-buddy/25 to-buddy/5 ring-1 ring-buddy/30 flex items-center justify-center">
            <MessageCircle className="h-4.5 w-4.5 text-buddy" strokeWidth={2.25} />
          </div>
          <div>
            <SheetTitle className="font-semibold leading-tight text-base">
              Buddy
            </SheetTitle>
            <p className="text-xs text-muted-foreground leading-tight">
              Route tips &amp; pace check-ins
            </p>
          </div>
        </div>

        <div
          ref={listRef}
          className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
        >
          {messages.length === 0 && (
            <div className="flex flex-col gap-2 mt-4">
              <p className="text-sm text-muted-foreground text-center mb-2">
                Ask about your route, pace, or just check in.
              </p>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="flex items-center gap-2.5 text-left rounded-xl bg-secondary border border-border px-4 py-3 text-sm active:bg-border transition-colors"
                >
                  <Sparkles className="h-4 w-4 shrink-0 text-buddy" />
                  {s}
                </button>
              ))}
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "self-end bg-primary text-primary-foreground rounded-2xl rounded-br-md"
                  : "self-start bg-secondary border border-buddy/20 rounded-2xl rounded-bl-md"
              }`}
            >
              {m.content ||
                (sending && i === messages.length - 1 ? <TypingDots /> : "")}
            </div>
          ))}

          {awaitingReply && lastMessage?.role === "user" && (
            <div className="self-start bg-secondary border border-buddy/20 rounded-2xl rounded-bl-md px-4 py-3">
              <TypingDots />
            </div>
          )}

          {error && <p className="text-bad text-xs text-center">{error}</p>}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2 px-4 py-3 border-t border-border pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Talk to Buddy..."
            disabled={sending}
            className="h-11 flex-1 rounded-full bg-secondary border-border px-4 focus-visible:border-buddy focus-visible:ring-buddy/30"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-buddy to-cyan-600 text-bg flex items-center justify-center disabled:opacity-30 active:scale-95 transition-transform"
            aria-label="Send"
          >
            <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-0.5">
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-buddy" />
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-buddy" />
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-buddy" />
    </span>
  );
}
