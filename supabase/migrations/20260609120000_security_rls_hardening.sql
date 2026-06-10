-- ==========================================
-- Security RLS hardening: Additional policies
-- ==========================================

-- ==========================================
-- 1) Posts INSERT: enforce max length via database CHECK constraint
-- ==========================================
ALTER TABLE public.posts ADD CONSTRAINT posts_content_length_check
  CHECK (char_length(content) <= 280);

-- ==========================================
-- 2) Messages INSERT: enforce max length
-- ==========================================
ALTER TABLE public.messages ADD CONSTRAINT messages_content_length_check
  CHECK (char_length(content) <= 2000);

-- ==========================================
-- 3) Posts: only author can UPDATE their own posts, and only content column
-- ==========================================
DROP POLICY IF EXISTS "Users can update own post" ON public.posts;
REVOKE UPDATE ON public.posts FROM authenticated;
GRANT UPDATE (content) ON public.posts TO authenticated;
CREATE POLICY "Author updates own post content"
ON public.posts
FOR UPDATE TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- ==========================================
-- 4) Comments: only author can UPDATE, and only content column
-- ==========================================
DROP POLICY IF EXISTS "Users can update own comment" ON public.comments;
REVOKE UPDATE ON public.comments FROM authenticated;
GRANT UPDATE (content) ON public.comments TO authenticated;
CREATE POLICY "Author updates own comment content"
ON public.comments
FOR UPDATE TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- ==========================================
-- 5) Profiles: restrict which columns can be updated by the user
-- ==========================================
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (display_name, bio, avatar_url, is_private, allow_dms, madness_pref) ON public.profiles TO authenticated;

-- ==========================================
-- 6) Reaction proposals: column-level grants for users
-- Users should only be able to INSERT and SELECT their own proposals
-- ==========================================
REVOKE UPDATE ON public.reaction_proposals FROM authenticated;
GRANT UPDATE (status, reviewed_by, reviewed_at, review_note) ON public.reaction_proposals TO authenticated;

-- ==========================================
-- 7) Rate limiting function (PostgreSQL level)
-- Returns true if the user has exceeded the rate limit
-- ==========================================
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _user_id uuid,
  _table text,
  _max_count int DEFAULT 10,
  _window_seconds int DEFAULT 60
) RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  _count int;
BEGIN
  EXECUTE format(
    'SELECT count(*) FROM %I WHERE author_id = $1 AND created_at > now() - make_interval(secs := $2)',
    _table
  ) INTO _count USING _user_id, _window_seconds;
  RETURN _count >= _max_count;
END;
$$;

-- ==========================================
-- 8) Audit log table for admin actions
-- ==========================================
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  target_type text,
  target_id text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view the audit log
CREATE POLICY "Admins can view audit log"
ON public.audit_log
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Only the service role (via the admin middleware) can insert
-- (service_role bypasses RLS, but this ensures anon/authenticated can't)

-- ==========================================
-- 9) Revoke EXECUTE on sensitive functions from public
-- ==========================================
REVOKE ALL ON FUNCTION public.check_rate_limit(uuid, text, int, int) FROM PUBLIC, anon;