import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { validateCsrfToken } from "@/lib/csrf";

// ---- Schemas ----

const approveProposalSchema = z.object({
  proposalId: z.string().uuid(),
  name: z.string().min(1).max(100),
  imageUrl: z.string().min(1),
});

const rejectProposalSchema = z.object({
  proposalId: z.string().uuid(),
  reviewNote: z.string().max(500).nullable(),
});

const resolveReportSchema = z.object({
  reportId: z.string().uuid(),
  status: z.enum(["resolved", "dismissed"]),
  resolutionNote: z.string().max(500).nullable(),
});

const hideTargetSchema = z.object({
  targetType: z.enum(["post", "comment", "user"]),
  targetId: z.string(),
  reportId: z.string().uuid(),
});

const togglePostVisibilitySchema = z.object({
  postId: z.string().uuid(),
  isHidden: z.boolean(),
});

const deletePostSchema = z.object({
  postId: z.string().uuid(),
});

const toggleUserBlockSchema = z.object({
  userId: z.string().uuid(),
  isBlocked: z.boolean(),
});

const searchUsersSchema = z.object({
  query: z.string().min(1).max(100),
});

const csrfTokenSchema = z.object({
  csrf_token: z.string().min(1),
});

// ---- Rate Limiting ----

// Each admin gets max N requests per sliding window
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 30; // max 30 admin actions per minute

/**
 * Checks rate limit using the Supabase rate_limiter table.
 * Uses the service_role client (supabaseAdmin) to bypass RLS.
 * On Vercel/serverless this is durable across restarts unlike in-memory Map.
 * Uses (supabaseAdmin.from as any) because rate_limiter is not in the generated Database types.
 */
async function checkRateLimit(userId: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

  // Delete expired entries for this user first
  await (supabaseAdmin.from as (table: string) => ReturnType<typeof supabaseAdmin.from>)("rate_limiter")
    .delete()
    .eq("user_id", userId)
    .lt("window_start", windowStart);

  // Count actions in current window
  const { count } = await (supabaseAdmin.from as (table: string) => ReturnType<typeof supabaseAdmin.from>)("rate_limiter")
    .select("user_id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("window_start", windowStart);

  if ((count ?? 0) >= RATE_LIMIT_MAX) {
    return false;
  }

  // Record this action
  await (supabaseAdmin.from as (table: string) => ReturnType<typeof supabaseAdmin.from>)("rate_limiter").insert({
    user_id: userId,
    action_count: 1,
    window_start: new Date().toISOString(),
  });

  return true;
}

// ---- Helpers ----

/**
 * Verifies that the caller is an admin, enforces rate limiting,
 * validates CSRF token, and returns their user ID.
 * csrfToken is REQUIRED — all admin mutations must be accompanied by a CSRF token.
 * Throws if not authenticated, not an admin, rate limited, or CSRF invalid.
 */
async function verifyAdmin(csrfToken: string): Promise<string> {
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

  // Verify the JWT token using the singleton admin client
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    console.warn(`[AdminAuth] Failed JWT verification: ${error?.message || "no user"}`);
    throw new Error("Unauthorized: Invalid or expired token");
  }

  // CSRF validation — REQUIRED (throws if missing or invalid)
  if (!validateCsrfToken(csrfToken, user.id)) {
    console.warn(`[AdminAuth] CSRF token mismatch for user ${user.id}`);
    throw new Error("Forbidden: Invalid CSRF token");
  }

  // Rate limiting check
  if (!(await checkRateLimit(user.id))) {
    console.warn(`[AdminAuth] Rate limit exceeded for user ${user.id}`);
    throw new Error("Too Many Requests: Rate limit exceeded. Please wait before retrying.");
  }

  // Check if user has admin role
  const { data: roles } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  if (!roles?.some((r) => r.role === "admin")) {
    console.warn(`[AdminAuth] Non-admin user ${user.id} attempted admin action`);
    throw new Error("Forbidden: Admin role required");
  }

  return user.id;
}

/**
 * Logs an admin action to the audit_log table using the RPC function.
 */
async function logAdminAction(
  adminId: string,
  actionType: string,
  targetType?: string | null,
  targetId?: string | null,
  details?: Record<string, unknown> | null,
) {
  // Use raw RPC call - log_admin_action may not be in generated Database types
  const { error } = await (supabaseAdmin.rpc as (name: string, args: Record<string, unknown>) => ReturnType<typeof supabaseAdmin.rpc>)("log_admin_action", {
    _admin_id: adminId,
    _action_type: actionType,
    _target_type: targetType ?? null,
    _target_id: targetId ?? null,
    _details: details ?? null,
  });

  if (error) {
    // Don't throw - audit logging failure shouldn't block the main action
    console.error("[AuditLog] Failed to log admin action:", error.message);
  }
}

// ---- Server Functions ----

export const adminApproveProposal = createServerFn({ method: "POST" })
  .inputValidator(approveProposalSchema.and(csrfTokenSchema))
  .handler(async ({ data }) => {
    const adminId = await verifyAdmin(data.csrf_token);

    // Check if reaction with same name already exists
    const { data: existing } = await supabaseAdmin
      .from("chat_reactions")
      .select("id")
      .eq("name", data.name)
      .maybeSingle();

    if (existing) {
      return { ok: false, error: "Реакция с таким именем уже существует" } as const;
    }

    // Insert the reaction
    const { error: insErr } = await supabaseAdmin.from("chat_reactions").insert({
      name: data.name,
      image_url: data.imageUrl,
      created_from_proposal: data.proposalId,
    });

    if (insErr) {
      return { ok: false, error: insErr.message } as const;
    }

    // Update proposal status
    const { error: updErr } = await supabaseAdmin
      .from("reaction_proposals")
      .update({ status: "approved", reviewed_at: new Date().toISOString() })
      .eq("id", data.proposalId);

    if (updErr) {
      return { ok: false, error: updErr.message } as const;
    }

    // Audit log
    await logAdminAction(adminId, "approve_proposal", "reaction_proposal", data.proposalId, {
      name: data.name,
    });

    return { ok: true } as const;
  });

export const adminRejectProposal = createServerFn({ method: "POST" })
  .inputValidator(rejectProposalSchema.and(csrfTokenSchema))
  .handler(async ({ data }) => {
    const adminId = await verifyAdmin(data.csrf_token);

    const { error } = await supabaseAdmin
      .from("reaction_proposals")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        review_note: data.reviewNote || null,
      })
      .eq("id", data.proposalId);

    if (error) {
      return { ok: false, error: error.message } as const;
    }

    await logAdminAction(adminId, "reject_proposal", "reaction_proposal", data.proposalId, {
      review_note: data.reviewNote,
    });

    return { ok: true } as const;
  });

export const adminResolveReport = createServerFn({ method: "POST" })
  .inputValidator(resolveReportSchema.and(csrfTokenSchema))
  .handler(async ({ data }) => {
    const adminId = await verifyAdmin(data.csrf_token);

    const { error } = await supabaseAdmin
      .from("reports")
      .update({
        status: data.status,
        resolved_at: new Date().toISOString(),
        resolution_note: data.resolutionNote || null,
      })
      .eq("id", data.reportId);

    if (error) {
      return { ok: false, error: error.message } as const;
    }

    await logAdminAction(
      adminId,
      data.status === "resolved" ? "resolve_report" : "dismiss_report",
      "report",
      data.reportId,
      { resolution_note: data.resolutionNote },
    );

    return { ok: true } as const;
  });

export const adminHideTarget = createServerFn({ method: "POST" })
  .inputValidator(hideTargetSchema.and(csrfTokenSchema))
  .handler(async ({ data }) => {
    const adminId = await verifyAdmin(data.csrf_token);

    if (data.targetType === "post") {
      const { error } = await supabaseAdmin
        .from("posts")
        .update({ is_hidden: true, hidden_reason: "report" })
        .eq("id", data.targetId);

      if (error) {
        return { ok: false, error: error.message } as const;
      }
    } else if (data.targetType === "comment") {
      const { error } = await supabaseAdmin
        .from("comments")
        .update({ is_hidden: true })
        .eq("id", data.targetId);

      if (error) {
        return { ok: false, error: error.message } as const;
      }
    } else if (data.targetType === "user") {
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ is_blocked: true })
        .eq("id", data.targetId);

      if (error) {
        return { ok: false, error: error.message } as const;
      }
    }

    // Also resolve the report
    const { error: reportErr } = await supabaseAdmin
      .from("reports")
      .update({ status: "resolved", resolved_at: new Date().toISOString() })
      .eq("id", data.reportId);

    if (reportErr) {
      return { ok: false, error: reportErr.message } as const;
    }

    await logAdminAction(adminId, "hide_target", data.targetType, data.targetId, {
      report_id: data.reportId,
    });

    return { ok: true } as const;
  });

export const adminTogglePostVisibility = createServerFn({ method: "POST" })
  .inputValidator(togglePostVisibilitySchema.and(csrfTokenSchema))
  .handler(async ({ data }) => {
    const adminId = await verifyAdmin(data.csrf_token);

    const { error } = await supabaseAdmin
      .from("posts")
      .update({
        is_hidden: data.isHidden,
        hidden_reason: data.isHidden ? "moderated" : null,
      })
      .eq("id", data.postId);

    if (error) {
      return { ok: false, error: error.message } as const;
    }

    await logAdminAction(adminId, data.isHidden ? "hide_post" : "unhide_post", "post", data.postId);

    return { ok: true } as const;
  });

export const adminDeletePost = createServerFn({ method: "POST" })
  .inputValidator(deletePostSchema.and(csrfTokenSchema))
  .handler(async ({ data }) => {
    const adminId = await verifyAdmin(data.csrf_token);

    const { error } = await supabaseAdmin.from("posts").delete().eq("id", data.postId);

    if (error) {
      return { ok: false, error: error.message } as const;
    }

    await logAdminAction(adminId, "delete_post", "post", data.postId);

    return { ok: true } as const;
  });

export const adminToggleUserBlock = createServerFn({ method: "POST" })
  .inputValidator(toggleUserBlockSchema.and(csrfTokenSchema))
  .handler(async ({ data }) => {
    const adminId = await verifyAdmin(data.csrf_token);

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ is_blocked: data.isBlocked })
      .eq("id", data.userId);

    if (error) {
      return { ok: false, error: error.message } as const;
    }

    // When blocking a user, terminate all active sessions immediately
    if (data.isBlocked) {
      await supabaseAdmin.auth.admin.signOut(data.userId);
    }

    await logAdminAction(
      adminId,
      data.isBlocked ? "block_user" : "unblock_user",
      "user",
      data.userId,
    );

    return { ok: true } as const;
  });

/**
 * Admin search users with safe ILIKE escaping via the safe_search_text DB function.
 * Prevents ILIKE injection through special characters (% _ \).
 */
export const adminSearchUsers = createServerFn({ method: "GET" })
  .inputValidator(searchUsersSchema.and(csrfTokenSchema))
  .handler(async ({ data }) => {
    await verifyAdmin(data.csrf_token);

    // Use the safe_search_text DB function to properly escape special characters
    const { data: escapedResult, error: rpcError } = await (supabaseAdmin.rpc as (name: string, args: Record<string, unknown>) => ReturnType<typeof supabaseAdmin.rpc>)(
      "safe_search_text",
      { search_term: data.query },
    );

    if (rpcError) {
      return { ok: false, error: rpcError.message, data: [] } as const;
    }

    const escaped = escapedResult as unknown as string;

    const { data: users, error } = await supabaseAdmin
      .from("profiles")
      .select("id,nickname,display_name,is_blocked,is_private")
      .or(`nickname.ilike.${escaped},` + `display_name.ilike.${escaped}`)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return { ok: false, error: error.message, data: [] } as const;
    }

    return { ok: true, data: users ?? [] } as const;
  });
