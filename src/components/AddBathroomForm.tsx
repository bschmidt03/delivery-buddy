"use client";

import { useState, FormEvent } from "react";
import { Accessibility, KeyRound, MapPinPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function AddBathroomForm({
  onSubmit,
  onCancel,
  submitting,
}: {
  onSubmit: (data: { name: string; notes: string; accessible: boolean; requiresCode: boolean }) => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [accessible, setAccessible] = useState(false);
  const [requiresCode, setRequiresCode] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({ name, notes, accessible, requiresCode });
  }

  return (
    <div className="absolute inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-4 sm:pb-0">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-3 rounded-3xl bg-surface p-5 shadow-2xl border border-accent-2/25 animate-fade-in"
      >
        <div className="flex items-center gap-2.5 mb-1">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-accent-2/25 to-accent-2/5 ring-1 ring-accent-2/30 flex items-center justify-center">
            <MapPinPlus className="h-4.5 w-4.5 text-accent-2" strokeWidth={2.25} />
          </div>
          <div>
            <h2 className="text-base font-semibold leading-tight">Drop a pit stop</h2>
            <p className="text-xs text-muted-foreground leading-tight">
              Pinned right where you tapped
            </p>
          </div>
        </div>

        <Input
          type="text"
          placeholder="Name (e.g. Shell station, Main St)"
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-11 rounded-xl bg-secondary focus-visible:border-accent-2 focus-visible:ring-accent-2/30"
        />
        <Textarea
          placeholder="Notes (hours, code, how clean, etc.)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="rounded-xl bg-secondary resize-none focus-visible:border-accent-2 focus-visible:ring-accent-2/30"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAccessible((v) => !v)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium border transition-colors ${
              accessible
                ? "bg-accent-2 text-bg border-accent-2"
                : "bg-secondary border-border text-muted-foreground"
            }`}
          >
            <Accessibility className="h-4 w-4" /> Accessible
          </button>
          <button
            type="button"
            onClick={() => setRequiresCode((v) => !v)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium border transition-colors ${
              requiresCode
                ? "bg-accent-2 text-bg border-accent-2"
                : "bg-secondary border-border text-muted-foreground"
            }`}
          >
            <KeyRound className="h-4 w-4" /> Needs code
          </button>
        </div>

        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl bg-secondary border border-border py-3 font-semibold active:bg-border transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-xl bg-gradient-to-br from-accent-2 to-amber-600 text-bg py-3 font-semibold ring-1 ring-white/15 active:scale-[0.97] transition-transform disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save pit stop"}
          </button>
        </div>
      </form>
    </div>
  );
}
