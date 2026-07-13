import type { Shift } from "./shift";

const CURRENT_KEY = "delivery-buddy:current-shift";
const HISTORY_KEY = "delivery-buddy:history";
const MAX_HISTORY = 20;

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadCurrentShift(): Shift | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(CURRENT_KEY);
    return raw ? (JSON.parse(raw) as Shift) : null;
  } catch {
    return null;
  }
}

export function saveCurrentShift(shift: Shift | null) {
  if (!isBrowser()) return;
  if (shift === null) {
    window.localStorage.removeItem(CURRENT_KEY);
  } else {
    window.localStorage.setItem(CURRENT_KEY, JSON.stringify(shift));
  }
}

export function loadHistory(): Shift[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as Shift[]) : [];
  } catch {
    return [];
  }
}

export function appendToHistory(shift: Shift) {
  if (!isBrowser()) return;
  const history = loadHistory();
  history.unshift(shift);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}
