/**
 * CSRF Protection Module
 *
 * Generates HMAC-based CSRF tokens bound to a user's session.
 * Token rotates every hour (instead of daily) to limit exposure window.
 */

import crypto from "crypto";

const CSRF_SECRET = (() => {
  const secret = process.env.CSRF_SECRET;
  if (!secret) {
    throw new Error(
      "CSRF_SECRET environment variable is required. " +
        "Set it to a random 64-character hex string (e.g. openssl rand -hex 32).",
    );
  }
  return secret;
})();

/**
 * Interval in hours for CSRF token rotation.
 * Tokens are valid for this many hours.
 * Set to 1 hour to minimize the window of exposure.
 */
const CSRF_TOKEN_VALIDITY_HOURS = 1;

/**
 * Generates a CSRF token bound to the user's session (userId + time slice).
 */
export function generateCsrfToken(userId: string): string {
  return generateCsrfTokenForHour(userId, getCurrentHourSlice());
}

/**
 * Validates a CSRF token for the given user.
 * Checks the current hour slice AND the previous one (grace period).
 */
export function validateCsrfToken(token: string, userId: string): boolean {
  // Check current hour
  const current = generateCsrfTokenForHour(userId, getCurrentHourSlice());
  if (constantTimeEqual(token, current)) return true;

  // Check previous hour (grace period for tokens generated near the boundary)
  const previous = generateCsrfTokenForHour(userId, getCurrentHourSlice(-1));
  if (constantTimeEqual(token, previous)) return true;

  return false;
}

/**
 * Generates a CSRF token for a specific hour slice.
 */
function generateCsrfTokenForHour(userId: string, hourSlice: string): string {
  const hmac = crypto.createHmac("sha256", CSRF_SECRET);
  hmac.update(userId);
  hmac.update(hourSlice);
  return hmac.digest("hex");
}

/**
 * Returns a date-hour string used for the time slice (e.g. "2026-06-09T16").
 */
function getCurrentHourSlice(offsetHours = 0): string {
  const d = new Date();
  d.setHours(d.getHours() + offsetHours);
  return d.toISOString().slice(0, 13); // YYYY-MM-DDTHH
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Do a dummy comparison to keep constant time relative to the shorter string
    const dummy = Buffer.alloc(a.length);
    crypto.timingSafeEqual(Buffer.from(a), dummy);
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
