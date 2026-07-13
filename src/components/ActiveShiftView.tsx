"use client";

import { useState } from "react";
import {
  activeMsElapsed,
  currentPace,
  formatDuration,
  formatTime,
  isPaused,
  paceDelta,
  projectedFinishTime,
  stopsRemaining,
  type Shift,
} from "@/lib/shift";

export function ActiveShiftView({
  shift,
  now,
  onAddStops,
  onSetCompleted,
  onTogglePause,
  onEndShift,
}: {
  shift: Shift;
  now: number;
  onAddStops: (delta: number) => void;
  onSetCompleted: (value: number) => void;
  onTogglePause: () => void;
  onEndShift: () => void;
  onDiscard?: () => void;
}) {
  const [showCorrect, setShowCorrect] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [pop, setPop] = useState(0);
  const [correctValue, setCorrectValue] = useState(String(shift.completedStops));

  const paused = isPaused(shift);
  const pace = currentPace(shift, now);
  const remaining = stopsRemaining(shift);
  const finish = projectedFinishTime(shift, now);
  const delta = paceDelta(shift, now);
  const elapsed = activeMsElapsed(shift, now);

  function bump(n: number) {
    onAddStops(n);
    setPop((p) => p + 1);
  }

  function openCorrect() {
    setCorrectValue(String(shift.completedStops));
    setShowCorrect(true);
  }

  function submitCorrect() {
    const n = Number(correctValue);
    if (!Number.isNaN(n)) onSetCompleted(n);
    setShowCorrect(false);
  }

  const statusColor =
    delta == null ? "text-muted" : delta >= 0 ? "text-good" : "text-bad";

  return (
    <div className="flex-1 flex flex-col px-5 pt-5 pb-6 max-w-md mx-auto w-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-accent/15 flex items-center justify-center text-accent text-base font-bold">
            D
          </div>
          <span className="text-sm text-muted font-medium">
            Started {formatTime(shift.startTime)}
          </span>
        </div>
        {paused && (
          <span className="text-xs font-bold tracking-wide uppercase bg-accent/15 text-accent px-2.5 py-1 rounded-full">
            Paused
          </span>
        )}
      </div>

      {/* Hero pace */}
      <div className="flex flex-col items-center text-center mb-6">
        <span className="text-sm text-muted uppercase tracking-wide font-semibold mb-1">
          Current pace
        </span>
        <div className="flex items-baseline gap-2">
          <span
            key={shift.completedStops}
            className="text-7xl font-bold tabular leading-none animate-pop"
          >
            {pace.toFixed(1)}
          </span>
          <span className="text-2xl text-muted font-semibold">/hr</span>
        </div>
        {delta != null && (
          <span className={`mt-3 text-sm font-bold ${statusColor}`}>
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}/hr {delta >= 0 ? "ahead" : "behind"} target
          </span>
        )}
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-2xl bg-surface border border-border px-4 py-4 flex flex-col items-center">
          <span className="text-xs text-muted uppercase tracking-wide font-semibold mb-1">
            Stops left
          </span>
          <span key={remaining} className="text-3xl font-bold tabular animate-pop">
            {remaining}
          </span>
          <span className="text-xs text-muted mt-1 tabular">
            {shift.completedStops}/{shift.totalStopsAssigned} done
          </span>
        </div>
        <div className="rounded-2xl bg-surface border border-border px-4 py-4 flex flex-col items-center">
          <span className="text-xs text-muted uppercase tracking-wide font-semibold mb-1">
            Finish by
          </span>
          <span className="text-3xl font-bold tabular whitespace-nowrap">
            {finish ? formatTime(finish) : "—"}
          </span>
          <span className="text-xs text-muted mt-1 tabular">{formatDuration(elapsed)} active</span>
        </div>
      </div>

      {/* Big +1 button */}
      <button
        key={pop}
        onClick={() => bump(1)}
        className="w-full rounded-3xl bg-accent text-bg text-3xl font-extrabold py-9 shadow-xl shadow-accent/25 transition-transform active:scale-[0.97] animate-pop mb-3"
      >
        + 1 Stop
      </button>

      <div className="grid grid-cols-3 gap-2 mb-6">
        <button
          onClick={() => onAddStops(-1)}
          className="rounded-xl bg-surface border border-border py-3 text-base font-semibold active:bg-surface-2"
        >
          −1
        </button>
        <button
          onClick={() => bump(5)}
          className="rounded-xl bg-surface border border-border py-3 text-base font-semibold active:bg-surface-2"
        >
          +5
        </button>
        <button
          onClick={openCorrect}
          className="rounded-xl bg-surface border border-border py-3 text-base font-semibold active:bg-surface-2"
        >
          Correct
        </button>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3">
        <button
          onClick={onTogglePause}
          className="rounded-xl border border-border py-4 text-base font-semibold active:bg-surface"
        >
          {paused ? "Resume" : "Pause"}
        </button>
        <button
          onClick={() => setShowEndConfirm(true)}
          className="rounded-xl border border-bad/40 text-bad py-4 text-base font-semibold active:bg-bad/10"
        >
          End Shift
        </button>
      </div>

      {showCorrect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="w-full max-w-sm rounded-2xl bg-surface border border-border p-5">
            <h2 className="text-lg font-semibold mb-4">Correct stop count</h2>
            <input
              type="number"
              inputMode="numeric"
              autoFocus
              value={correctValue}
              onChange={(e) => setCorrectValue(e.target.value)}
              className="w-full rounded-xl bg-bg border border-border px-4 py-3 text-2xl tabular text-center mb-4 focus:outline-none focus:border-accent"
            />
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowCorrect(false)}
                className="rounded-xl border border-border py-3 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={submitCorrect}
                className="rounded-xl bg-accent text-bg py-3 font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="w-full max-w-sm rounded-2xl bg-surface border border-border p-5">
            <h2 className="text-lg font-semibold mb-2">End this shift?</h2>
            <p className="text-sm text-muted mb-5">
              You&apos;ve completed {shift.completedStops} of {shift.totalStopsAssigned} stops.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="rounded-xl border border-border py-3 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEndConfirm(false);
                  onEndShift();
                }}
                className="rounded-xl bg-bad text-bg py-3 font-semibold"
              >
                End Shift
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
