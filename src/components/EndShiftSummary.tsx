"use client";

import { PartyPopper, Rabbit, Turtle } from "lucide-react";
import {
  activeMsElapsed,
  bestWorstHour,
  currentPace,
  formatDuration,
  formatTime,
  type Shift,
} from "@/lib/shift";

export function EndShiftSummary({ shift, onDone }: { shift: Shift; onDone: () => void }) {
  const end = shift.endTime ?? shift.startTime;
  const elapsed = activeMsElapsed(shift, end);
  const pace = currentPace(shift, end);
  const { best, worst } = bestWorstHour(shift, end);

  return (
    <div className="relative flex-1 flex flex-col px-5 pt-10 pb-6 max-w-md mx-auto w-full animate-fade-in">
      {/* Ambient celebratory glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-primary/15 blur-3xl"
      />

      <div className="relative flex flex-col items-center text-center mb-8">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent-2 flex items-center justify-center shadow-lg shadow-primary/30 ring-1 ring-white/20 mb-4">
          <PartyPopper className="h-7 w-7 text-primary-foreground" strokeWidth={2} />
        </div>
        <span className="text-[11px] text-primary uppercase tracking-[0.18em] font-semibold mb-1">
          Shift complete
        </span>
        <h1 className="text-3xl font-bold">Nice work.</h1>
        <p className="text-sm text-muted-foreground mt-2 tabular">
          {formatTime(shift.startTime)} — {formatTime(end)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <SummaryCard label="Total stops" value={String(shift.completedStops)} />
        <SummaryCard label="Active time" value={formatDuration(elapsed)} />
        <SummaryCard label="Avg pace" value={`${pace.toFixed(1)}/hr`} />
        <SummaryCard
          label="Completion"
          value={`${Math.min(
            100,
            Math.round((shift.completedStops / Math.max(1, shift.totalStopsAssigned)) * 100)
          )}%`}
        />
      </div>

      {(best || worst) && (
        <div className="rounded-2xl bg-card border border-border p-4 mb-8">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-3">
            Hour-by-hour
          </p>
          {best && (
            <div className="flex items-center gap-2 text-sm">
              <Rabbit className="h-4 w-4 text-good" />
              <span className="text-good font-semibold">Best:</span>
              <span className="tabular">
                Hour {best.hourIndex + 1} · {best.count} stops
              </span>
            </div>
          )}
          {worst && worst !== best && (
            <div className="flex items-center gap-2 text-sm mt-2">
              <Turtle className="h-4 w-4 text-bad" />
              <span className="text-bad font-semibold">Slowest:</span>
              <span className="tabular">
                Hour {worst.hourIndex + 1} · {worst.count} stops
              </span>
            </div>
          )}
        </div>
      )}

      <button
        onClick={onDone}
        className="mt-auto w-full rounded-2xl bg-gradient-to-b from-primary to-[#f07a2b] text-primary-foreground text-lg font-bold py-5 shadow-xl shadow-primary/25 ring-1 ring-white/20 active:scale-[0.98] transition-transform"
      >
        Done
      </button>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border px-4 py-4 flex flex-col items-center">
      <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
        {label}
      </span>
      <span className="text-3xl font-bold tabular">{value}</span>
    </div>
  );
}
