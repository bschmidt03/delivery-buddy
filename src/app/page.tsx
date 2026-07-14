"use client";

import { useCallback, useEffect, useState } from "react";
import { useShift } from "@/hooks/useShift";
import { ShiftSetup } from "@/components/ShiftSetup";
import { ActiveShiftView } from "@/components/ActiveShiftView";
import { EndShiftSummary } from "@/components/EndShiftSummary";
import { ChatFab } from "@/components/ChatFab";
import { ChatDrawer } from "@/components/ChatDrawer";
import { PitStopFab } from "@/components/PitStopFab";
import { PitStopSheet } from "@/components/PitStopSheet";
import { loadHistory } from "@/lib/storage";
import type { Shift } from "@/lib/shift";
import {
  activeMsElapsed,
  currentPace,
  paceDelta,
  stopsRemaining,
} from "@/lib/shift";
import type { ShiftContext } from "@/lib/chatContext";

export default function Home() {
  const {
    shift,
    justEnded,
    now,
    hydrated,
    startShift,
    addStops,
    setCompletedStops,
    togglePause,
    endShift,
    dismissSummary,
  } = useShift();
  const [history, setHistory] = useState<Shift[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [pitStopOpen, setPitStopOpen] = useState(false);

  useEffect(() => {
    // Same post-hydration localStorage read as useShift's current-shift sync.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (hydrated) setHistory(loadHistory());
  }, [hydrated, justEnded]);

  const getContext = useCallback((): ShiftContext => {
    if (!shift) return null;
    return {
      active: true,
      pace: currentPace(shift, now),
      stopsRemaining: stopsRemaining(shift),
      totalStops: shift.totalStopsAssigned,
      completedStops: shift.completedStops,
      targetPace: shift.targetPace,
      paceDelta: paceDelta(shift, now),
      activeMinutes: Math.round(activeMsElapsed(shift, now) / 60000),
    };
  }, [shift, now]);

  if (!hydrated) {
    return <div className="flex-1 bg-bg" />;
  }

  return (
    <>
      {justEnded ? (
        <EndShiftSummary shift={justEnded} onDone={dismissSummary} />
      ) : shift ? (
        <ActiveShiftView
          shift={shift}
          now={now}
          onAddStops={addStops}
          onSetCompleted={setCompletedStops}
          onTogglePause={togglePause}
          onEndShift={endShift}
        />
      ) : (
        <ShiftSetup onStart={startShift} history={history} />
      )}

      <PitStopFab onClick={() => setPitStopOpen(true)} />
      <PitStopSheet open={pitStopOpen} onClose={() => setPitStopOpen(false)} />

      <ChatFab onClick={() => setChatOpen(true)} />
      <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} getContext={getContext} />
    </>
  );
}
