import { c as createServerRpc, s as supabaseAdmin } from "./client.server-DRVOQYFl.mjs";
import { c as createServerFn, b as getRequest } from "./server-TPS-gfXU.mjs";
import { v as validateCsrfToken } from "./csrf-CBKysP7H.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType, e as enumType, b as booleanType } from "../_libs/zod.mjs";
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
const approveProposalSchema = objectType({
  proposalId: stringType().uuid(),
  name: stringType().min(1).max(100),
  imageUrl: stringType().min(1)
});
const rejectProposalSchema = objectType({
  proposalId: stringType().uuid(),
  reviewNote: stringType().max(500).nullable()
});
const resolveReportSchema = objectType({
  reportId: stringType().uuid(),
  status: enumType(["resolved", "dismissed"]),
  resolutionNote: stringType().max(500).nullable()
});
const hideTargetSchema = objectType({
  targetType: enumType(["post", "comment", "user"]),
  targetId: stringType(),
  reportId: stringType().uuid()
});
const togglePostVisibilitySchema = objectType({
  postId: stringType().uuid(),
  isHidden: booleanType()
});
const deletePostSchema = objectType({
  postId: stringType().uuid()
});
const toggleUserBlockSchema = objectType({
  userId: stringType().uuid(),
  isBlocked: booleanType()
});
const searchUsersSchema = objectType({
  query: stringType().min(1).max(100)
});
const csrfTokenSchema = objectType({
  csrf_token: stringType().min(1)
});
const RATE_LIMIT_WINDOW_MS = 6e4;
const RATE_LIMIT_MAX = 30;
async function checkRateLimit(userId) {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  await supabaseAdmin.from("rate_limiter").delete().eq("user_id", userId).lt("window_start", windowStart);
  const {
    count
  } = await supabaseAdmin.from("rate_limiter").select("user_id", {
    count: "exact",
    head: true
  }).eq("user_id", userId).gte("window_start", windowStart);
  if ((count ?? 0) >= RATE_LIMIT_MAX) {
    return false;
  }
  await supabaseAdmin.from("rate_limiter").insert({
    user_id: userId,
    action_count: 1,
    window_start: (/* @__PURE__ */ new Date()).toISOString()
  });
  return true;
}
async function verifyAdmin(csrfToken) {
  const request = getRequest();
  if (!request?.headers) {
    throw new Error("Unauthorized: No request headers available");
  }
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("[AdminAuth] Missing or invalid authorization header");
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
    console.warn(`[AdminAuth] Failed JWT verification: ${error?.message || "no user"}`);
    throw new Error("Unauthorized: Invalid or expired token");
  }
  if (!validateCsrfToken(csrfToken, user.id)) {
    console.warn(`[AdminAuth] CSRF token mismatch for user ${user.id}`);
    throw new Error("Forbidden: Invalid CSRF token");
  }
  if (!await checkRateLimit(user.id)) {
    console.warn(`[AdminAuth] Rate limit exceeded for user ${user.id}`);
    throw new Error("Too Many Requests: Rate limit exceeded. Please wait before retrying.");
  }
  const {
    data: roles
  } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", user.id);
  if (!roles?.some((r) => r.role === "admin")) {
    console.warn(`[AdminAuth] Non-admin user ${user.id} attempted admin action`);
    throw new Error("Forbidden: Admin role required");
  }
  return user.id;
}
async function logAdminAction(adminId, actionType, targetType, targetId, details) {
  const {
    error
  } = await supabaseAdmin.rpc("log_admin_action", {
    _admin_id: adminId,
    _action_type: actionType,
    _target_type: targetType ?? null,
    _target_id: targetId ?? null,
    _details: details ?? null
  });
  if (error) {
    console.error("[AuditLog] Failed to log admin action:", error.message);
  }
}
const adminApproveProposal_createServerFn_handler = createServerRpc({
  id: "f43ce6a43b7a311ccede4cc0c70dcc09c688007914d57de9d1449f6b8e77e1e6",
  name: "adminApproveProposal",
  filename: "src/lib/api/admin.functions.ts"
}, (opts) => adminApproveProposal.__executeServer(opts));
const adminApproveProposal = createServerFn({
  method: "POST"
}).validator(approveProposalSchema.and(csrfTokenSchema)).handler(adminApproveProposal_createServerFn_handler, async ({
  data
}) => {
  const adminId = await verifyAdmin(data.csrf_token);
  const {
    data: existing
  } = await supabaseAdmin.from("chat_reactions").select("id").eq("name", data.name).maybeSingle();
  if (existing) {
    return {
      ok: false,
      error: "Реакция с таким именем уже существует"
    };
  }
  const {
    error: insErr
  } = await supabaseAdmin.from("chat_reactions").insert({
    name: data.name,
    image_url: data.imageUrl,
    created_from_proposal: data.proposalId
  });
  if (insErr) {
    return {
      ok: false,
      error: insErr.message
    };
  }
  const {
    error: updErr
  } = await supabaseAdmin.from("reaction_proposals").update({
    status: "approved",
    reviewed_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", data.proposalId);
  if (updErr) {
    return {
      ok: false,
      error: updErr.message
    };
  }
  await logAdminAction(adminId, "approve_proposal", "reaction_proposal", data.proposalId, {
    name: data.name
  });
  return {
    ok: true
  };
});
const adminRejectProposal_createServerFn_handler = createServerRpc({
  id: "abf53afb892525751ddc164df1b9872fd4e7c8eb34aa548cf0baafffeadd2994",
  name: "adminRejectProposal",
  filename: "src/lib/api/admin.functions.ts"
}, (opts) => adminRejectProposal.__executeServer(opts));
const adminRejectProposal = createServerFn({
  method: "POST"
}).validator(rejectProposalSchema.and(csrfTokenSchema)).handler(adminRejectProposal_createServerFn_handler, async ({
  data
}) => {
  const adminId = await verifyAdmin(data.csrf_token);
  const {
    error
  } = await supabaseAdmin.from("reaction_proposals").update({
    status: "rejected",
    reviewed_at: (/* @__PURE__ */ new Date()).toISOString(),
    review_note: data.reviewNote || null
  }).eq("id", data.proposalId);
  if (error) {
    return {
      ok: false,
      error: error.message
    };
  }
  await logAdminAction(adminId, "reject_proposal", "reaction_proposal", data.proposalId, {
    review_note: data.reviewNote
  });
  return {
    ok: true
  };
});
const adminResolveReport_createServerFn_handler = createServerRpc({
  id: "90823a00db079ae8fb993c910a2d697d8c0d139f6ea01bb047fdc8daec268a7b",
  name: "adminResolveReport",
  filename: "src/lib/api/admin.functions.ts"
}, (opts) => adminResolveReport.__executeServer(opts));
const adminResolveReport = createServerFn({
  method: "POST"
}).validator(resolveReportSchema.and(csrfTokenSchema)).handler(adminResolveReport_createServerFn_handler, async ({
  data
}) => {
  const adminId = await verifyAdmin(data.csrf_token);
  const {
    error
  } = await supabaseAdmin.from("reports").update({
    status: data.status,
    resolved_at: (/* @__PURE__ */ new Date()).toISOString(),
    resolution_note: data.resolutionNote || null
  }).eq("id", data.reportId);
  if (error) {
    return {
      ok: false,
      error: error.message
    };
  }
  await logAdminAction(adminId, data.status === "resolved" ? "resolve_report" : "dismiss_report", "report", data.reportId, {
    resolution_note: data.resolutionNote
  });
  return {
    ok: true
  };
});
const adminHideTarget_createServerFn_handler = createServerRpc({
  id: "95380920034da2d96147884dfc00dbc1b9a2655c577ac8755ecb01c48d7f9408",
  name: "adminHideTarget",
  filename: "src/lib/api/admin.functions.ts"
}, (opts) => adminHideTarget.__executeServer(opts));
const adminHideTarget = createServerFn({
  method: "POST"
}).validator(hideTargetSchema.and(csrfTokenSchema)).handler(adminHideTarget_createServerFn_handler, async ({
  data
}) => {
  const adminId = await verifyAdmin(data.csrf_token);
  if (data.targetType === "post") {
    const {
      error
    } = await supabaseAdmin.from("posts").update({
      is_hidden: true,
      hidden_reason: "report"
    }).eq("id", data.targetId);
    if (error) {
      return {
        ok: false,
        error: error.message
      };
    }
  } else if (data.targetType === "comment") {
    const {
      error
    } = await supabaseAdmin.from("comments").update({
      is_hidden: true
    }).eq("id", data.targetId);
    if (error) {
      return {
        ok: false,
        error: error.message
      };
    }
  } else if (data.targetType === "user") {
    const {
      error
    } = await supabaseAdmin.from("profiles").update({
      is_blocked: true
    }).eq("id", data.targetId);
    if (error) {
      return {
        ok: false,
        error: error.message
      };
    }
  }
  const {
    error: reportErr
  } = await supabaseAdmin.from("reports").update({
    status: "resolved",
    resolved_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", data.reportId);
  if (reportErr) {
    return {
      ok: false,
      error: reportErr.message
    };
  }
  await logAdminAction(adminId, "hide_target", data.targetType, data.targetId, {
    report_id: data.reportId
  });
  return {
    ok: true
  };
});
const adminTogglePostVisibility_createServerFn_handler = createServerRpc({
  id: "cc4687b1d171a1dfe433ea5e30a11ffa3870f35af730d2646717ddf61d4ff042",
  name: "adminTogglePostVisibility",
  filename: "src/lib/api/admin.functions.ts"
}, (opts) => adminTogglePostVisibility.__executeServer(opts));
const adminTogglePostVisibility = createServerFn({
  method: "POST"
}).validator(togglePostVisibilitySchema.and(csrfTokenSchema)).handler(adminTogglePostVisibility_createServerFn_handler, async ({
  data
}) => {
  const adminId = await verifyAdmin(data.csrf_token);
  const {
    error
  } = await supabaseAdmin.from("posts").update({
    is_hidden: data.isHidden,
    hidden_reason: data.isHidden ? "moderated" : null
  }).eq("id", data.postId);
  if (error) {
    return {
      ok: false,
      error: error.message
    };
  }
  await logAdminAction(adminId, data.isHidden ? "hide_post" : "unhide_post", "post", data.postId);
  return {
    ok: true
  };
});
const adminDeletePost_createServerFn_handler = createServerRpc({
  id: "53883aae55dbd771cf716dc3d01091f1f5b3d1919e5e761c406c6542c46bc855",
  name: "adminDeletePost",
  filename: "src/lib/api/admin.functions.ts"
}, (opts) => adminDeletePost.__executeServer(opts));
const adminDeletePost = createServerFn({
  method: "POST"
}).validator(deletePostSchema.and(csrfTokenSchema)).handler(adminDeletePost_createServerFn_handler, async ({
  data
}) => {
  const adminId = await verifyAdmin(data.csrf_token);
  const {
    error
  } = await supabaseAdmin.from("posts").delete().eq("id", data.postId);
  if (error) {
    return {
      ok: false,
      error: error.message
    };
  }
  await logAdminAction(adminId, "delete_post", "post", data.postId);
  return {
    ok: true
  };
});
const adminToggleUserBlock_createServerFn_handler = createServerRpc({
  id: "7e19663fcb415e99c6b2831c275109dd53cb74bcab5e33210f0a3bd6ec05e3d4",
  name: "adminToggleUserBlock",
  filename: "src/lib/api/admin.functions.ts"
}, (opts) => adminToggleUserBlock.__executeServer(opts));
const adminToggleUserBlock = createServerFn({
  method: "POST"
}).validator(toggleUserBlockSchema.and(csrfTokenSchema)).handler(adminToggleUserBlock_createServerFn_handler, async ({
  data
}) => {
  const adminId = await verifyAdmin(data.csrf_token);
  const {
    error
  } = await supabaseAdmin.from("profiles").update({
    is_blocked: data.isBlocked
  }).eq("id", data.userId);
  if (error) {
    return {
      ok: false,
      error: error.message
    };
  }
  if (data.isBlocked) {
    await supabaseAdmin.auth.admin.signOut(data.userId);
  }
  await logAdminAction(adminId, data.isBlocked ? "block_user" : "unblock_user", "user", data.userId);
  return {
    ok: true
  };
});
const adminSearchUsers_createServerFn_handler = createServerRpc({
  id: "7545713fb69c8c4e284a62168f6eddda5a0b7ae062051a61ecb1c0c5dba3d9c2",
  name: "adminSearchUsers",
  filename: "src/lib/api/admin.functions.ts"
}, (opts) => adminSearchUsers.__executeServer(opts));
const adminSearchUsers = createServerFn({
  method: "GET"
}).validator(searchUsersSchema.and(csrfTokenSchema)).handler(adminSearchUsers_createServerFn_handler, async ({
  data
}) => {
  await verifyAdmin(data.csrf_token);
  const {
    data: escapedResult,
    error: rpcError
  } = await supabaseAdmin.rpc("safe_search_text", {
    search_term: data.query
  });
  if (rpcError) {
    return {
      ok: false,
      error: rpcError.message,
      data: []
    };
  }
  const escaped = escapedResult;
  const {
    data: users,
    error
  } = await supabaseAdmin.from("profiles").select("id,nickname,display_name,is_blocked,is_private").or(`nickname.ilike.${escaped},display_name.ilike.${escaped}`).order("created_at", {
    ascending: false
  }).limit(50);
  if (error) {
    return {
      ok: false,
      error: error.message,
      data: []
    };
  }
  return {
    ok: true,
    data: users ?? []
  };
});
export {
  adminApproveProposal_createServerFn_handler,
  adminDeletePost_createServerFn_handler,
  adminHideTarget_createServerFn_handler,
  adminRejectProposal_createServerFn_handler,
  adminResolveReport_createServerFn_handler,
  adminSearchUsers_createServerFn_handler,
  adminTogglePostVisibility_createServerFn_handler,
  adminToggleUserBlock_createServerFn_handler
};
