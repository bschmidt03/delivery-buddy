"use client";

import { useState } from "react";
import type { Shift } from "@/lib/shift";
import { formatDuration, formatTime, currentPace, activeMsElapsed } from "@/lib/shift";

const STOP_PRESETS = [100, 125, 150, 175, 200, 225];
const PACE_PRESETS = [15, 20, 25, 30];

function toTimeInputValue(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function timeInputToToday(value: string, base: number): number {
  const [h, m] = value.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

export function ShiftSetup({
  onStart,
  history,
}: {
  onStart: (opts: { startTime: number; totalStopsAssigned: number; targetPace: number | null }) => void;
  history: Shift[];
}) {
  const [now] = useState(() => Date.now());
  const [totalStops, setTotalStops] = useState<number | null>(null);
  const [startTimeStr, setStartTimeStr] = useState(() => toTimeInputValue(now));
  const [targetPace, setTargetPace] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const canStart = totalStops != null && totalStops > 0;

  function handleStart() {
    if (!canStart) return;
    onStart({
      startTime: timeInputToToday(startTimeStr, now),
      totalStopsAssigned: totalStops!,
      targetPace,
    });
  }

  return (
    <div className="flex-1 flex flex-col px-5 pt-8 pb-6 max-w-md mx-auto w-full animate-fade-in">
      <div className="flex items-center gap-2 mb-8">
        <div className="h-9 w-9 rounded-xl bg-accent/15 flex items-center justify-center text-accent text-lg font-bold">
          D
        </div>
        <h1 className="text-xl font-semibold tracking-tight">Delivery Buddy</h1>
      </div>

      <p className="text-sm text-muted mb-2 uppercase tracking-wide font-medium">
        Stops assigned today
      </p>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {STOP_PRESETS.map((n) => (
          <button
            key={n}
            onClick={() => setTotalStops(n)}
            className={`rounded-xl py-3 text-lg font-semibold tabular transition-colors ${
              totalStops === n
                ? "bg-accent text-bg"
                : "bg-surface text-fg border border-border active:bg-surface-2"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <input
        type="number"
        inputMode="numeric"
        placeholder="Or type exact count"
        value={totalStops ?? ""}
        onChange={(e) => setTotalStops(e.target.value ? Number(e.target.value) : null)}
        className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-lg tabular placeholder:text-muted mb-8 focus:outline-none focus:border-accent"
      />

      <p className="text-sm text-muted mb-2 uppercase tracking-wide font-medium">
        Shift start time
      </p>
      <input
        type="time"
        value={startTimeStr}
        onChange={(e) => setStartTimeStr(e.target.value)}
        className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-lg tabular mb-8 focus:outline-none focus:border-accent"
      />

      <p className="text-sm text-muted mb-2 uppercase tracking-wide font-medium">
        Target pace{" "}
        <span className="normal-case font-normal text-muted/70">(optional)</span>
      </p>
      <div className="grid grid-cols-4 gap-2 mb-10">
        {PACE_PRESETS.map((n) => (
          <button
            key={n}
            onClick={() => setTargetPace(targetPace === n ? null : n)}
            className={`rounded-xl py-3 text-base font-semibold tabular transition-colors ${
              targetPace === n
                ? "bg-accent text-bg"
                : "bg-surface text-fg border border-border active:bg-surface-2"
            }`}
          >
            {n}/hr
          </button>
        ))}
      </div>

      <button
        onClick={handleStart}
        disabled={!canStart}
        className="w-full rounded-2xl bg-accent text-bg text-xl font-bold py-5 shadow-lg shadow-accent/20 transition-transform active:scale-[0.98] disabled:opacity-30 disabled:shadow-none mb-8"
      >
        Start Shift
      </button>

      {history.length > 0 && (
        <div className="mt-auto pt-4 border-t border-border">
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="text-sm text-muted font-medium mb-3"
          >
            {showHistory ? "Hide" : "Show"} recent shifts ({history.length})
          </button>
          {showHistory && (
            <div className="flex flex-col gap-2">
              {history.slice(0, 5).map((s) => {
                const pace = currentPace(s, s.endTime ?? now);
                const ms = activeMsElapsed(s, s.endTime ?? now);
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-sm"
                  >
                    <span className="text-muted">
                      {formatTime(s.startTime)} · {formatDuration(ms)}
                    </span>
                    <span className="tabular font-semibold">
                      {s.completedStops} stops · {pace.toFixed(1)}/hr
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
