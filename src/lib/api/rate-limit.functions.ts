/**
 * Rate limiting for public endpoints (login, signup).
 * Uses IP-based tracking via Supabase DB.
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Extracts the client IP from the request headers.
 * Checks multiple headers for reverse proxy support (Cloudflare, Vercel, etc.)
 */
function getClientIp(): string {
  const request = getRequest();

  if (!request?.headers) {
    return "unknown";
  }

  // Cloudflare
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf;

  // Vercel / general proxy
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // Take the first IP in the chain (client IP)
    return forwarded.split(",")[0].trim();
  }

  // Fallback to direct remote address or unknown
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

/**
 * Checks rate limit for a given endpoint and IP.
 * Returns { allowed: true } if the request can proceed.
 * Throws an error if rate limited.
 */
async function enforceRateLimit(
  endpoint: string,
  maxCount: number,
  windowSeconds: number,
): Promise<void> {
  const ip = getClientIp();

  // First record the action (optimistic insertion)
  const { error: recordError } = await (supabaseAdmin.rpc as (name: string, args: Record<string, unknown>) => ReturnType<typeof supabaseAdmin.rpc>)("record_ip_action", {
    _ip_address: ip,
    _endpoint: endpoint,
  });

  if (recordError) {
    console.error("[RateLimit] Failed to record action:", recordError.message);
    // Don't block the request on recording failure
    return;
  }

  // Then check if we've exceeded the limit
  const { data: allowed, error: checkError } = await (supabaseAdmin.rpc as (name: string, args: Record<string, unknown>) => ReturnType<typeof supabaseAdmin.rpc>)(
    "check_ip_rate_limit",
    {
      _ip_address: ip,
      _endpoint: endpoint,
      _max_count: maxCount,
      _window_seconds: windowSeconds,
    },
  );

  if (checkError) {
    console.error("[RateLimit] Failed to check limit:", checkError.message);
    // Don't block on check failure
    return;
  }

  if (allowed === false) {
    throw new Error("Слишком много попыток. Попробуйте позже.");
  }
}

/**
 * Enforces rate limit for login endpoint: max 5 attempts per IP per 15 minutes.
 */
export const enforceLoginRateLimit = createServerFn({ method: "GET" }).handler(async () => {
  await enforceRateLimit("login", 5, 900); // 5 per 15 minutes
  return { ok: true };
});

/**
 * Enforces rate limit for signup endpoint: max 3 attempts per IP per hour.
 */
export const enforceSignupRateLimit = createServerFn({ method: "GET" }).handler(async () => {
  await enforceRateLimit("signup", 3, 3600); // 3 per hour
  return { ok: true };
});
