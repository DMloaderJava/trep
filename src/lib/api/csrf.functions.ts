/**
 * Server function to obtain a CSRF token for the currently authenticated user.
 * The client calls this once on admin page mount and includes the token
 * in every subsequent admin mutation request.
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { generateCsrfToken } from "@/lib/csrf";

export const getCsrfToken = createServerFn({ method: "GET" }).handler(async () => {
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

  // Verify the JWT token
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    throw new Error("Unauthorized: Invalid or expired token");
  }

  // Generate and return a CSRF token bound to this user's session
  const csrfToken = generateCsrfToken(user.id);

  return { csrf_token: csrfToken };
});
