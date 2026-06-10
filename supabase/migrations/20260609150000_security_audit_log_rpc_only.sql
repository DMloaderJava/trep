-- ==========================================
-- Security: Restrict audit_log INSERT to RPC only
-- ==========================================

-- Drop the overly permissive INSERT policy that allows direct inserts
-- by authenticated admins. The audit log should only be written via the
-- log_admin_action() RPC function, which uses SECURITY INVOKER and respects
-- the caller's permissions.
DROP POLICY IF EXISTS "Admins can insert audit log" ON public.audit_log;

-- Revoke direct INSERT on audit_log from all roles (authenticated, anon)
-- Only the service role (which bypasses RLS) can insert directly.
-- The log_admin_action() RPC function is SECURITY INVOKER and runs with the
-- caller's privileges, but since it's invoked via supabaseAdmin (service_role
-- client), the service role performs the actual insert.
REVOKE INSERT ON public.audit_log FROM anon, authenticated;

-- Ensure the log_admin_action function can still insert.
-- Since it's SECURITY INVOKER and called by service_role, no special grant
-- is needed — the service role bypasses RLS entirely.

-- Add a comment documenting the security model
COMMENT ON TABLE public.audit_log IS
  'Admin audit log. Direct INSERT is revoked for all roles. '
  'Writes happen exclusively via log_admin_action() RPC called with service_role.';