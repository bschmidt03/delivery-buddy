"use client";

import { useState } from "react";
import { Clock3, Gauge, History, Package, Truck } from "lucide-react";
import { Input } from "@/components/ui/input";
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

function SectionLabel({
  icon: Icon,
  children,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-2.5 uppercase tracking-[0.14em] font-semibold">
      <Icon className="h-3.5 w-3.5 text-primary" />
      {children}
      {hint && (
        <span className="normal-case tracking-normal font-normal text-muted-foreground/60">
          {hint}
        </span>
      )}
    </p>
  );
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
    <div className="relative flex-1 flex flex-col px-5 pt-8 pb-6 max-w-md mx-auto w-full animate-fade-in">
      {/* Ambient glow behind the header */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative flex items-center gap-3 mb-9">
        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary to-accent-2 flex items-center justify-center shadow-lg shadow-primary/25 ring-1 ring-white/20">
          <Truck className="h-5.5 w-5.5 text-primary-foreground" strokeWidth={2.25} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight leading-tight">Delivery Buddy</h1>
          <p className="text-xs text-muted-foreground">Set up today&apos;s route</p>
        </div>
      </div>

      <SectionLabel icon={Package}>Stops assigned today</SectionLabel>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {STOP_PRESETS.map((n) => (
          <button
            key={n}
            onClick={() => setTotalStops(n)}
            className={`rounded-xl py-3 text-lg font-semibold tabular transition-all ${
              totalStops === n
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]"
                : "bg-card text-fg border border-border active:bg-secondary"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <Input
        type="number"
        inputMode="numeric"
        placeholder="Or type exact count"
        value={totalStops ?? ""}
        onChange={(e) => setTotalStops(e.target.value ? Number(e.target.value) : null)}
        className="h-12 rounded-xl bg-card px-4 text-lg tabular mb-8"
      />

      <SectionLabel icon={Clock3}>Shift start time</SectionLabel>
      <Input
        type="time"
        value={startTimeStr}
        onChange={(e) => setStartTimeStr(e.target.value)}
        className="h-12 rounded-xl bg-card px-4 text-lg tabular mb-8"
      />

      <SectionLabel icon={Gauge} hint="(optional)">
        Target pace
      </SectionLabel>
      <div className="grid grid-cols-4 gap-2 mb-10">
        {PACE_PRESETS.map((n) => (
          <button
            key={n}
            onClick={() => setTargetPace(targetPace === n ? null : n)}
            className={`rounded-xl py-3 text-base font-semibold tabular transition-all ${
              targetPace === n
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]"
                : "bg-card text-fg border border-border active:bg-secondary"
            }`}
          >
            {n}/hr
          </button>
        ))}
      </div>

      <button
        onClick={handleStart}
        disabled={!canStart}
        className="w-full rounded-2xl bg-gradient-to-b from-primary to-[#f07a2b] text-primary-foreground text-xl font-bold py-5 shadow-xl shadow-primary/25 ring-1 ring-white/20 transition-all active:scale-[0.98] disabled:opacity-30 disabled:shadow-none disabled:ring-0 mb-8"
      >
        Start Shift
      </button>

      {history.length > 0 && (
        <div className="mt-auto pt-4 border-t border-border">
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium mb-3"
          >
            <History className="h-4 w-4" />
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
                    className="flex items-center justify-between rounded-xl bg-card border border-border px-3.5 py-2.5 text-sm"
                  >
                    <span className="text-muted-foreground">
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
