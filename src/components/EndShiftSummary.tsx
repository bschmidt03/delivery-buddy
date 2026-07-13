"use client";

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
    <div className="flex-1 flex flex-col px-5 pt-10 pb-6 max-w-md mx-auto w-full animate-fade-in">
      <div className="flex flex-col items-center text-center mb-8">
        <span className="text-sm text-accent uppercase tracking-wide font-semibold mb-1">
          Shift complete
        </span>
        <h1 className="text-3xl font-bold">Nice work.</h1>
        <p className="text-sm text-muted mt-2">
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
        <div className="rounded-2xl bg-surface border border-border p-4 mb-8">
          <p className="text-xs text-muted uppercase tracking-wide font-semibold mb-3">
            Hour-by-hour
          </p>
          <div className="flex justify-between text-sm">
            {best && (
              <div>
                <span className="text-good font-semibold">Best: </span>
                <span className="tabular">
                  Hour {best.hourIndex + 1} · {best.count} stops
                </span>
              </div>
            )}
          </div>
          {worst && worst !== best && (
            <div className="flex justify-between text-sm mt-1">
              <div>
                <span className="text-bad font-semibold">Slowest: </span>
                <span className="tabular">
                  Hour {worst.hourIndex + 1} · {worst.count} stops
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={onDone}
        className="mt-auto w-full rounded-2xl bg-accent text-bg text-lg font-bold py-5 active:scale-[0.98] transition-transform"
      >
        Done
      </button>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface border border-border px-4 py-4 flex flex-col items-center">
      <span className="text-xs text-muted uppercase tracking-wide font-semibold mb-1">
        {label}
      </span>
      <span className="text-3xl font-bold tabular">{value}</span>
    </div>
  );
}
