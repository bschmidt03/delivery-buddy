"use client";

import { useState } from "react";
import {
  Flag,
  MapPin,
  Pause,
  Pencil,
  Play,
  TrendingDown,
  TrendingUp,
  Truck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const progress = Math.min(
    100,
    (shift.completedStops / Math.max(1, shift.totalStopsAssigned)) * 100
  );

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

  return (
    <div className="relative flex-1 flex flex-col px-5 pt-5 pb-6 max-w-md mx-auto w-full animate-fade-in">
      {/* Ambient glow behind the hero pace */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-8 left-1/2 -translate-x-1/2 h-56 w-72 rounded-full bg-primary/10 blur-3xl"
      />

      {/* Header */}
      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-accent-2 flex items-center justify-center shadow-md shadow-primary/20 ring-1 ring-white/15">
            <Truck className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.25} />
          </div>
          <span className="text-sm text-muted-foreground font-medium">
            Started {formatTime(shift.startTime)}
          </span>
        </div>
        {paused && (
          <span className="flex items-center gap-1 text-xs font-bold tracking-wide uppercase bg-primary/15 text-primary px-2.5 py-1 rounded-full">
            <Pause className="h-3 w-3" /> Paused
          </span>
        )}
      </div>

      {/* Hero pace */}
      <div className="relative flex flex-col items-center text-center mb-6">
        <span className="text-[11px] text-muted-foreground uppercase tracking-[0.18em] font-semibold mb-1.5">
          Current pace
        </span>
        <div className="flex items-baseline gap-2">
          <span
            key={shift.completedStops}
            className="text-7xl font-bold tabular leading-none animate-pop bg-gradient-to-b from-fg to-fg/70 bg-clip-text text-transparent"
          >
            {pace.toFixed(1)}
          </span>
          <span className="text-2xl text-muted-foreground font-semibold">/hr</span>
        </div>
        {delta != null && (
          <span
            className={`mt-3 flex items-center gap-1.5 text-sm font-bold rounded-full px-3 py-1 ${
              delta >= 0 ? "text-good bg-good/10" : "text-bad bg-bad/10"
            }`}
          >
            {delta >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {Math.abs(delta).toFixed(1)}/hr {delta >= 0 ? "ahead of" : "behind"} target
          </span>
        )}
      </div>

      {/* Route progress */}
      <div className="mb-6">
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent-2 transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-[11px] text-muted-foreground tabular">
          <span>{shift.completedStops} done</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-2xl bg-card border border-border px-4 py-4 flex flex-col items-center">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
            <MapPin className="h-3 w-3" /> Stops left
          </span>
          <span key={remaining} className="text-3xl font-bold tabular animate-pop">
            {remaining}
          </span>
          <span className="text-xs text-muted-foreground mt-1 tabular">
            of {shift.totalStopsAssigned} assigned
          </span>
        </div>
        <div className="rounded-2xl bg-card border border-border px-4 py-4 flex flex-col items-center">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
            <Flag className="h-3 w-3" /> Finish by
          </span>
          <span className="text-3xl font-bold tabular whitespace-nowrap">
            {finish ? formatTime(finish) : "—"}
          </span>
          <span className="text-xs text-muted-foreground mt-1 tabular">
            {formatDuration(elapsed)} active
          </span>
        </div>
      </div>

      {/* Big +1 button */}
      <button
        key={pop}
        onClick={() => bump(1)}
        className="w-full rounded-3xl bg-gradient-to-b from-primary to-[#f07a2b] text-primary-foreground text-3xl font-extrabold py-9 shadow-xl shadow-primary/25 ring-1 ring-white/20 transition-transform active:scale-[0.97] animate-pop mb-3"
      >
        + 1 Stop
      </button>

      <div className="grid grid-cols-3 gap-2 mb-6">
        <button
          onClick={() => onAddStops(-1)}
          className="rounded-xl bg-card border border-border py-3 text-base font-semibold active:bg-secondary transition-colors"
        >
          −1
        </button>
        <button
          onClick={() => bump(5)}
          className="rounded-xl bg-card border border-border py-3 text-base font-semibold active:bg-secondary transition-colors"
        >
          +5
        </button>
        <button
          onClick={openCorrect}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-card border border-border py-3 text-base font-semibold active:bg-secondary transition-colors"
        >
          <Pencil className="h-4 w-4 text-muted-foreground" /> Fix
        </button>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3">
        <button
          onClick={onTogglePause}
          className="flex items-center justify-center gap-2 rounded-xl border border-border py-4 text-base font-semibold active:bg-card transition-colors"
        >
          {paused ? <Play className="h-4.5 w-4.5" /> : <Pause className="h-4.5 w-4.5" />}
          {paused ? "Resume" : "Pause"}
        </button>
        <button
          onClick={() => setShowEndConfirm(true)}
          className="flex items-center justify-center gap-2 rounded-xl border border-bad/40 text-bad py-4 text-base font-semibold active:bg-bad/10 transition-colors"
        >
          <Flag className="h-4.5 w-4.5" /> End Shift
        </button>
      </div>

      <Dialog open={showCorrect} onOpenChange={setShowCorrect}>
        <DialogContent className="max-w-sm rounded-2xl" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Correct stop count</DialogTitle>
          </DialogHeader>
          <Input
            type="number"
            inputMode="numeric"
            autoFocus
            value={correctValue}
            onChange={(e) => setCorrectValue(e.target.value)}
            className="h-14 rounded-xl text-2xl tabular text-center"
          />
          <DialogFooter className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-11 rounded-xl text-base font-semibold"
              onClick={() => setShowCorrect(false)}
            >
              Cancel
            </Button>
            <Button
              className="h-11 rounded-xl text-base font-semibold"
              onClick={submitCorrect}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showEndConfirm} onOpenChange={setShowEndConfirm}>
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>End this shift?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ve completed {shift.completedStops} of {shift.totalStopsAssigned}{" "}
              stops.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="grid grid-cols-2 gap-3">
            <AlertDialogCancel className="h-11 rounded-xl text-base font-semibold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="h-11 rounded-xl text-base font-semibold bg-bad text-bg hover:bg-bad/90"
              onClick={onEndShift}
            >
              End Shift
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
