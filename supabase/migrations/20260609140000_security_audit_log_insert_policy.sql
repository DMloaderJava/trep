-- ==========================================
-- Security: Add INSERT policy for audit_log
-- ==========================================

-- Allow service role (Admin API) to insert into audit_log
-- Service role bypasses RLS, but this policy allows authenticated admins
-- to insert via the RPC function if needed
CREATE POLICY "Admins can insert audit log"
ON public.audit_log
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Ensure the log_admin_action function has proper SECURITY INVOKER
-- (already set in migration 20260609130000)

-- Also revoke direct INSERT on audit_log from anon
REVOKE INSERT ON public.audit_log FROM anon;