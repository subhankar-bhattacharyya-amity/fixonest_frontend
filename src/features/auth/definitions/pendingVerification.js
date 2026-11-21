// Remembers which email is waiting for OTP verification (and its code
// timers) for this browser tab, so a page refresh on /verify-email keeps the
// countdowns instead of starting over. sessionStorage can be unavailable
// (private mode, blocked storage), so every access is guarded.
const STORAGE_KEY = "pendingEmailVerification";

export function readPendingVerification() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// data: { email, issuedAt, expiresAt, resendAvailableAt } (timestamps in ms)
export function savePendingVerification(data) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage blocked — the page still works, timers just reset on refresh.
  }
}

export function clearPendingVerification() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}
