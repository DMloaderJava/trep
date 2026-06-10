-- ==========================================
-- Security fix: Post reactions, Follows, and SECURITY DEFINER hardening
-- ==========================================

-- ==========================================
-- Fix #3: Post reactions must check post author privacy
-- The previous policy ("View reactions" USING true) exposed reaction data
-- for posts belonging to private users.
-- ==========================================
DROP POLICY IF EXISTS "View reactions" ON public.post_reactions;
CREATE POLICY "View reactions"
ON public.post_reactions FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id = post_id
      AND public.can_view_private_user(p.author_id)
  )
);


-- ==========================================
-- Fix #2: Follows — prevent leaking private user follow graphs
-- The previous policy used can_view_private_user() which allowed a follower
-- of a private user to see that private user's entire follow graph.
-- Now: only the owner/admin see private relationships; public relationships
-- are visible to all authenticated users.
-- ==========================================
DROP POLICY IF EXISTS "View follows" ON public.follows;
CREATE POLICY "View follows"
ON public.follows FOR SELECT TO authenticated
USING (
  auth.uid() = follower_id
  OR auth.uid() = followee_id
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = follower_id AND p.is_private = false)
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = followee_id AND p.is_private = false)
  )
);


-- ==========================================
-- Fix #4 & #5: Switch SECURITY DEFINER functions to SECURITY INVOKER
-- These functions are only called within RLS policies where auth.uid()
-- matches the calling user's session, so SECURITY INVOKER is safe and
-- follows the principle of least privilege.
-- ==========================================

-- 1) has_role: used in RLS policies with auth.uid() — safe to switch
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 2) can_view_private_user: used in RLS policies — safe to switch
CREATE OR REPLACE FUNCTION public.can_view_private_user(_owner uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    _owner = auth.uid()
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = _owner AND p.is_private = false)
    OR EXISTS (SELECT 1 FROM public.follows f WHERE f.follower_id = auth.uid() AND f.followee_id = _owner)
$$;

-- Revoke EXECUTE on prevent_message_tampering (plpgsql trigger function,
-- no SECURITY DEFINER specified, so it defaults to SECURITY INVOKER;
-- but it should not be callable directly via the API)
REVOKE ALL ON FUNCTION public.prevent_message_tampering() FROM PUBLIC, anon, authenticated;