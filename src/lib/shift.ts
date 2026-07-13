export type Pause = { start: number; end: number | null };
export type StopEvent = { timestamp: number; delta: number };

export type Shift = {
  id: string;
  startTime: number;
  endTime: number | null;
  totalStopsAssigned: number;
  targetPace: number | null;
  completedStops: number;
  events: StopEvent[];
  pauses: Pause[];
};

export function newShift(opts: {
  startTime: number;
  totalStopsAssigned: number;
  targetPace: number | null;
}): Shift {
  return {
    id: `shift_${opts.startTime}_${Math.floor(Math.random() * 1e6)}`,
    startTime: opts.startTime,
    endTime: null,
    totalStopsAssigned: opts.totalStopsAssigned,
    targetPace: opts.targetPace,
    completedStops: 0,
    events: [],
    pauses: [],
  };
}

export function isPaused(shift: Shift): boolean {
  const last = shift.pauses[shift.pauses.length - 1];
  return !!last && last.end === null;
}

/** Active (non-paused) milliseconds elapsed between shift start and `at`. */
export function activeMsElapsedAt(shift: Shift, at: number): number {
  let pausedMs = 0;
  for (const p of shift.pauses) {
    const pStart = Math.max(p.start, shift.startTime);
    const pEnd = Math.min(p.end ?? at, at);
    if (pEnd > pStart) pausedMs += pEnd - pStart;
  }
  const total = Math.max(0, at - shift.startTime);
  return Math.max(0, total - pausedMs);
}

export function activeMsElapsed(shift: Shift, now: number): number {
  return activeMsElapsedAt(shift, shift.endTime ?? now);
}

// Below this, elapsed time is too noisy to divide by — a single early stop would
// otherwise spike pace to implausible numbers (e.g. 700+/hr in the first minute).
const PACE_FLOOR_MS = 5 * 60_000;

export function currentPace(shift: Shift, now: number): number {
  const ms = Math.max(activeMsElapsed(shift, now), PACE_FLOOR_MS);
  const hours = ms / 3_600_000;
  return shift.completedStops / hours;
}

export function stopsRemaining(shift: Shift): number {
  return Math.max(0, shift.totalStopsAssigned - shift.completedStops);
}

export function projectedFinishTime(shift: Shift, now: number): number | null {
  const remaining = stopsRemaining(shift);
  if (remaining <= 0) return now;
  const pace = currentPace(shift, now);
  if (pace <= 0) return null;
  const hoursNeeded = remaining / pace;
  return now + hoursNeeded * 3_600_000;
}

export function paceDelta(shift: Shift, now: number): number | null {
  if (shift.targetPace == null) return null;
  return currentPace(shift, now) - shift.targetPace;
}

export type HourBucket = { hourIndex: number; count: number; partial: boolean };

export function hourlyBuckets(shift: Shift, now: number): HourBucket[] {
  const end = shift.endTime ?? now;
  const totalActiveMs = activeMsElapsedAt(shift, end);
  const totalHours = Math.ceil(totalActiveMs / 3_600_000);
  const buckets: HourBucket[] = Array.from({ length: Math.max(totalHours, 0) }, (_, i) => ({
    hourIndex: i,
    count: 0,
    partial: false,
  }));

  for (const ev of shift.events) {
    if (ev.delta <= 0) continue;
    const elapsedAtEvent = activeMsElapsedAt(shift, ev.timestamp);
    const idx = Math.min(
      Math.floor(elapsedAtEvent / 3_600_000),
      Math.max(buckets.length - 1, 0)
    );
    if (buckets[idx]) buckets[idx].count += ev.delta;
  }

  const lastBucketMs = totalActiveMs % 3_600_000;
  if (buckets.length > 0 && lastBucketMs > 0 && lastBucketMs < 3_600_000) {
    buckets[buckets.length - 1].partial = true;
  }

  return buckets;
}

export function bestWorstHour(shift: Shift, now: number): { best: HourBucket | null; worst: HourBucket | null } {
  const complete = hourlyBuckets(shift, now).filter((b) => !b.partial);
  if (complete.length === 0) return { best: null, worst: null };
  let best = complete[0];
  let worst = complete[0];
  for (const b of complete) {
    if (b.count > best.count) best = b;
    if (b.count < worst.count) worst = b;
  }
  return { best, worst };
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function formatDuration(ms: number): string {
  const totalMin = Math.round(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}
