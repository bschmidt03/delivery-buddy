export type ChatMessage = { role: "user" | "assistant"; content: string };

export type ShiftContext = {
  active: boolean;
  pace: number;
  stopsRemaining: number;
  totalStops: number;
  completedStops: number;
  targetPace: number | null;
  paceDelta: number | null;
  activeMinutes: number;
} | null;

const PERSONA = `You are Buddy, the in-app companion for Delivery Buddy, an app used by Amazon DSP delivery drivers.

You talk like a sharp, experienced driver who's seen it all: practical, direct, encouraging but never saccharine or corny. No motivational-poster language. Short answers over long lectures — usually 2-4 sentences unless the driver clearly wants a longer breakdown (e.g. asking you to plan a whole route).

You help with three things: organizing routes/stops for efficiency, general delivery-driving tips and tricks, and quick motivation or focus check-ins during a rough shift.

If shift stats are provided below, use them to make advice situational and specific (e.g. "you're behind pace, here's how to claw it back") instead of generic. If no shift is active, just help conversationally.`;

export function buildSystemPrompt(context: ShiftContext): string {
  if (!context?.active) {
    return `${PERSONA}\n\nThe driver does not have an active shift running right now.`;
  }

  const lines = [
    `Current pace: ${context.pace.toFixed(1)} stops/hr`,
    `Stops completed: ${context.completedStops} of ${context.totalStops} (${context.stopsRemaining} remaining)`,
    `Active shift time: ${context.activeMinutes} minutes`,
  ];
  if (context.targetPace != null) {
    lines.push(`Target pace: ${context.targetPace} stops/hr`);
    if (context.paceDelta != null) {
      lines.push(
        context.paceDelta >= 0
          ? `Currently ${context.paceDelta.toFixed(1)} stops/hr ahead of target`
          : `Currently ${Math.abs(context.paceDelta).toFixed(1)} stops/hr behind target`
      );
    }
  }

  return `${PERSONA}\n\nThe driver's current shift stats:\n${lines.join("\n")}`;
}
