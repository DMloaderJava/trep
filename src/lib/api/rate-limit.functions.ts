/**
 * Rate limiting for public endpoints (login, signup).
 * Uses IP-based tracking via Supabase DB.
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

/**
 * Extracts the client IP from the request headers.
 */
function getClientIp(): string {
  const request = getRequest();
  if (!request?.headers) return "unknown";

  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

/**
 * Checks rate limit for a given endpoint and IP.
 * Throws an error if rate limited.
 */
async function enforceRateLimit(
  endpoint: string,
  maxCount: number,
  windowSeconds: number,
): Promise<void> {
  // Load the admin client inside the handler (server-only module)
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const ip = getClientIp();

  const { error: recordError } = await (supabaseAdmin.rpc as (name: string, args: Record<string, unknown>) => ReturnType<typeof supabaseAdmin.rpc>)("record_ip_action", {
    _ip_address: ip,
    _endpoint: endpoint,
  });

  if (recordError) {
    console.error("[RateLimit] Failed to record action:", recordError.message);
    return;
  }

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
    return;
  }

  if (allowed === false) {
    throw new Error("Слишком много попыток. Попробуйте позже.");
  }
}

/** Max 5 login attempts per IP per 15 minutes. */
export const enforceLoginRateLimit = createServerFn({ method: "GET" }).handler(async () => {
  await enforceRateLimit("login", 5, 900);
  return { ok: true };
});

/** Max 3 signup attempts per IP per hour. */
export const enforceSignupRateLimit = createServerFn({ method: "GET" }).handler(async () => {
  await enforceRateLimit("signup", 3, 3600);
  return { ok: true };
});
