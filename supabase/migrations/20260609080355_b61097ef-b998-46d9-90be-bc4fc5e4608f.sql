
-- Posts (трепы)
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (length(content) BETWEEN 1 AND 280),
  is_hidden boolean NOT NULL DEFAULT false,
  hidden_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View visible posts or own or admin" ON public.posts FOR SELECT TO authenticated
USING (
  (is_hidden = false)
  OR auth.uid() = author_id
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Authors create posts" ON public.posts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors update own" ON public.posts FOR UPDATE TO authenticated
USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Admins update any post" ON public.posts FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authors or admin delete" ON public.posts FOR DELETE TO authenticated
USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX posts_author_created_idx ON public.posts(author_id, created_at DESC);
CREATE INDEX posts_created_idx ON public.posts(created_at DESC);
CREATE TRIGGER posts_touch BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Reactions on posts (likes etc.)
CREATE TABLE public.post_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction text NOT NULL CHECK (reaction IN ('laugh','brain','coffee','ambulance','fish')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id, reaction)
);
GRANT SELECT, INSERT, DELETE ON public.post_reactions TO authenticated;
GRANT ALL ON public.post_reactions TO service_role;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View reactions" ON public.post_reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Own reactions insert" ON public.post_reactions FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own reactions delete" ON public.post_reactions FOR DELETE TO authenticated
USING (auth.uid() = user_id);
CREATE INDEX post_reactions_post_idx ON public.post_reactions(post_id);

-- Comments
CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (length(content) BETWEEN 1 AND 500),
  is_hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT ALL ON public.comments TO service_role;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View visible comments" ON public.comments FOR SELECT TO authenticated
USING (is_hidden = false OR auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Create own comment" ON public.comments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Author or admin delete comment" ON public.comments FOR DELETE TO authenticated
USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin hides comment" ON public.comments FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX comments_post_idx ON public.comments(post_id, created_at);

-- Follows
CREATE TABLE public.follows (
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, followee_id),
  CHECK (follower_id <> followee_id)
);
GRANT SELECT, INSERT, DELETE ON public.follows TO authenticated;
GRANT ALL ON public.follows TO service_role;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View follows" ON public.follows FOR SELECT TO authenticated USING (true);
CREATE POLICY "Follow as self" ON public.follows FOR INSERT TO authenticated
WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Unfollow as self" ON public.follows FOR DELETE TO authenticated
USING (auth.uid() = follower_id);
CREATE INDEX follows_followee_idx ON public.follows(followee_id);

-- Direct messages
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (length(content) BETWEEN 1 AND 2000),
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (sender_id <> recipient_id)
);
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View own messages" ON public.messages FOR SELECT TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Send messages" ON public.messages FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = recipient_id AND p.allow_dms = true AND p.is_blocked = false)
);
CREATE POLICY "Recipient marks read" ON public.messages FOR UPDATE TO authenticated
USING (auth.uid() = recipient_id) WITH CHECK (auth.uid() = recipient_id);
CREATE INDEX messages_pair_idx ON public.messages(sender_id, recipient_id, created_at DESC);
CREATE INDEX messages_recipient_idx ON public.messages(recipient_id, created_at DESC);

-- Reports
CREATE TYPE public.report_target AS ENUM ('post','comment','user','message');
CREATE TYPE public.report_status AS ENUM ('pending','resolved','dismissed');
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type public.report_target NOT NULL,
  target_id uuid NOT NULL,
  reason text NOT NULL CHECK (length(reason) BETWEEN 1 AND 500),
  status public.report_status NOT NULL DEFAULT 'pending',
  resolved_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  resolution_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reporter sees own, admins see all" ON public.reports FOR SELECT TO authenticated
USING (auth.uid() = reporter_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Create own report" ON public.reports FOR INSERT TO authenticated
WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins resolve" ON public.reports FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX reports_status_idx ON public.reports(status, created_at DESC);
