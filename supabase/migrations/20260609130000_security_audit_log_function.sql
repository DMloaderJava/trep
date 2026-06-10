-- ==========================================
-- Security: Add audit logging function for admin actions
-- and safe text search helper
-- ==========================================

-- Safe text search function that properly escapes ILIKE patterns
CREATE OR REPLACE FUNCTION public.safe_search_text(search_term text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  escaped text;
BEGIN
  -- Escape special ILIKE characters: %, _, and escape character itself
  escaped := replace(search_term, '\', '\\');
  escaped := replace(escaped, '%', '\%');
  escaped := replace(escaped, '_', '\_');
  -- Wrap in wildcards for partial matching
  RETURN '%' || escaped || '%';
END;
$$;

-- Helper function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  _admin_id uuid,
  _action_type text,
  _target_type text DEFAULT NULL,
  _target_id text DEFAULT NULL,
  _details jsonb DEFAULT NULL
) RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  INSERT INTO public.audit_log (admin_id, action_type, target_type, target_id, details)
  VALUES (_admin_id, _action_type, _target_type, _target_id, _details);
$$;

-- Revoke EXECUTE from public/anon
REVOKE ALL ON FUNCTION public.safe_search_text(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.log_admin_action(uuid, text, text, text, jsonb) FROM PUBLIC, anon;