import { c as createServerRpc, s as supabaseAdmin } from "./client.server-DRVOQYFl.mjs";
import { c as createServerFn, b as getRequest } from "./server-TPS-gfXU.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/isbot.mjs";
function getClientIp() {
  const request = getRequest();
  if (!request?.headers) {
    return "unknown";
  }
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf;
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}
async function enforceRateLimit(endpoint, maxCount, windowSeconds) {
  const ip = getClientIp();
  const {
    error: recordError
  } = await supabaseAdmin.rpc("record_ip_action", {
    _ip_address: ip,
    _endpoint: endpoint
  });
  if (recordError) {
    console.error("[RateLimit] Failed to record action:", recordError.message);
    return;
  }
  const {
    data: allowed,
    error: checkError
  } = await supabaseAdmin.rpc("check_ip_rate_limit", {
    _ip_address: ip,
    _endpoint: endpoint,
    _max_count: maxCount,
    _window_seconds: windowSeconds
  });
  if (checkError) {
    console.error("[RateLimit] Failed to check limit:", checkError.message);
    return;
  }
  if (allowed === false) {
    throw new Error("Слишком много попыток. Попробуйте позже.");
  }
}
const enforceLoginRateLimit_createServerFn_handler = createServerRpc({
  id: "0981c250f37895363cd4865c9bbfe3d0ef8e241f624c4e0a5fcf9950bad925d9",
  name: "enforceLoginRateLimit",
  filename: "src/lib/api/rate-limit.functions.ts"
}, (opts) => enforceLoginRateLimit.__executeServer(opts));
const enforceLoginRateLimit = createServerFn({
  method: "GET"
}).handler(enforceLoginRateLimit_createServerFn_handler, async () => {
  await enforceRateLimit("login", 5, 900);
  return {
    ok: true
  };
});
const enforceSignupRateLimit_createServerFn_handler = createServerRpc({
  id: "2fcd4cc0d03e86b29a5cf46742e11dfd36574ccd151860828d5b809f47626044",
  name: "enforceSignupRateLimit",
  filename: "src/lib/api/rate-limit.functions.ts"
}, (opts) => enforceSignupRateLimit.__executeServer(opts));
const enforceSignupRateLimit = createServerFn({
  method: "GET"
}).handler(enforceSignupRateLimit_createServerFn_handler, async () => {
  await enforceRateLimit("signup", 3, 3600);
  return {
    ok: true
  };
});
export {
  enforceLoginRateLimit_createServerFn_handler,
  enforceSignupRateLimit_createServerFn_handler
};
