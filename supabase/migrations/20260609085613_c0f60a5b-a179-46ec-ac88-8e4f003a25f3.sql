
-- 1) Prevent message tampering: only allow read_at to change on UPDATE
CREATE OR REPLACE FUNCTION public.prevent_message_tampering()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.content IS DISTINCT FROM OLD.content
     OR NEW.sender_id IS DISTINCT FROM OLD.sender_id
     OR NEW.recipient_id IS DISTINCT FROM OLD.recipient_id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Only read_at may be updated on messages';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_message_tampering_trg ON public.messages;
CREATE TRIGGER prevent_message_tampering_trg
BEFORE UPDATE ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.prevent_message_tampering();

-- 2) Privacy helper: can current user see private content of `_owner`?
CREATE OR REPLACE FUNCTION public.can_view_private_user(_owner uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    _owner = auth.uid()
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = _owner AND p.is_private = false)
    OR EXISTS (SELECT 1 FROM public.follows f WHERE f.follower_id = auth.uid() AND f.followee_id = _owner)
$$;

REVOKE ALL ON FUNCTION public.can_view_private_user(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_view_private_user(uuid) TO authenticated;

-- 3) Posts: restrict reads from private profiles
DROP POLICY IF EXISTS "View visible posts or own or admin" ON public.posts;
CREATE POLICY "View visible posts"
ON public.posts FOR SELECT TO authenticated
USING (
  (is_hidden = false OR auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'::app_role))
  AND public.can_view_private_user(author_id)
);

-- 4) Comments: hide when post author is private and viewer can't see them
DROP POLICY IF EXISTS "View visible comments" ON public.comments;
CREATE POLICY "View visible comments"
ON public.comments FOR SELECT TO authenticated
USING (
  (is_hidden = false OR auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'::app_role))
  AND public.can_view_private_user(author_id)
  AND EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id = comments.post_id
      AND public.can_view_private_user(p.author_id)
  )
);

-- 5) Follows: hide relationships involving private users from outsiders
DROP POLICY IF EXISTS "View follows" ON public.follows;
CREATE POLICY "View follows"
ON public.follows FOR SELECT TO authenticated
USING (
  auth.uid() = follower_id
  OR auth.uid() = followee_id
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR (
    public.can_view_private_user(follower_id)
    AND public.can_view_private_user(followee_id)
  )
);

-- 6) Storage: UPDATE/DELETE policies on reaction-proposals bucket
DROP POLICY IF EXISTS "Owner or admin update reaction proposal files" ON storage.objects;
CREATE POLICY "Owner or admin update reaction proposal files"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'reaction-proposals'
  AND ((storage.foldername(name))[1] = auth.uid()::text
       OR public.has_role(auth.uid(), 'admin'::app_role))
)
WITH CHECK (
  bucket_id = 'reaction-proposals'
  AND ((storage.foldername(name))[1] = auth.uid()::text
       OR public.has_role(auth.uid(), 'admin'::app_role))
);

DROP POLICY IF EXISTS "Owner or admin delete reaction proposal files" ON storage.objects;
CREATE POLICY "Owner or admin delete reaction proposal files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'reaction-proposals'
  AND ((storage.foldername(name))[1] = auth.uid()::text
       OR public.has_role(auth.uid(), 'admin'::app_role))
);

-- 7) Lock down SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
