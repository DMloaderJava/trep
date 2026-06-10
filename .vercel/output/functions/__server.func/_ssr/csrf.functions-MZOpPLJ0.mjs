import { c as createServerRpc, s as supabaseAdmin } from "./client.server-DRVOQYFl.mjs";
import { c as createServerFn, b as getRequest } from "./server-TPS-gfXU.mjs";
import { g as generateCsrfToken } from "./csrf-CBKysP7H.mjs";
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
const getCsrfToken_createServerFn_handler = createServerRpc({
  id: "d9f5c6571ad7cc723632ee4990201c4db7ace04de0ad3f729b3b93bd215fd42e",
  name: "getCsrfToken",
  filename: "src/lib/api/csrf.functions.ts"
}, (opts) => getCsrfToken.__executeServer(opts));
const getCsrfToken = createServerFn({
  method: "GET"
}).handler(getCsrfToken_createServerFn_handler, async () => {
  const request = getRequest();
  if (!request?.headers) {
    throw new Error("Unauthorized: No request headers available");
  }
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized: No valid authorization header");
  }
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    throw new Error("Unauthorized: No token provided");
  }
  const {
    data: {
      user
    },
    error
  } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    throw new Error("Unauthorized: Invalid or expired token");
  }
  const csrfToken = generateCsrfToken(user.id);
  return {
    csrf_token: csrfToken
  };
});
export {
  getCsrfToken_createServerFn_handler
};
