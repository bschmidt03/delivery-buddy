"use client";

import { useCallback, useState } from "react";
import type { ChatMessage, ShiftContext } from "@/lib/chatContext";

export function useChat(getContext: () => ShiftContext) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending) return;

      const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
      setMessages([...nextMessages, { role: "assistant", content: "" }]);
      setSending(true);
      setError(null);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: nextMessages, context: getContext() }),
        });

        if (!res.ok || !res.body) {
          throw new Error("Buddy didn't respond. Try again.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let content = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          content += decoder.decode(value, { stream: true });
          setMessages([...nextMessages, { role: "assistant", content }]);
        }
      } catch {
        setError("Buddy didn't respond. Try again.");
        setMessages(nextMessages);
      } finally {
        setSending(false);
      }
    },
    [messages, sending, getContext]
  );

  return { messages, sending, error, send };
}
