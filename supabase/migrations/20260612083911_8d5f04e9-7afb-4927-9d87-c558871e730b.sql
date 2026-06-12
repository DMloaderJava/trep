-- 1. post_attachments
CREATE TABLE public.post_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_attachments TO authenticated;
GRANT SELECT ON public.post_attachments TO anon;
GRANT ALL ON public.post_attachments TO service_role;
ALTER TABLE public.post_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View attachments of visible posts" ON public.post_attachments
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.is_hidden = false AND public.can_view_private_user(p.author_id))
);
CREATE POLICY "Authors add attachments" ON public.post_attachments
FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.author_id = auth.uid())
);
CREATE POLICY "Authors delete attachments" ON public.post_attachments
FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.author_id = auth.uid())
);

-- 2. message_attachments
CREATE TABLE public.message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.message_attachments TO authenticated;
GRANT ALL ON public.message_attachments TO service_role;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants view message attachments" ON public.message_attachments
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.messages m WHERE m.id = message_id AND (m.sender_id = auth.uid() OR m.recipient_id = auth.uid()))
);
CREATE POLICY "Senders add message attachments" ON public.message_attachments
FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.messages m WHERE m.id = message_id AND m.sender_id = auth.uid())
);

-- 3. IP rate limiting
CREATE TABLE public.ip_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  endpoint text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ip_rate_limits_lookup ON public.ip_rate_limits (ip_address, endpoint, created_at);
GRANT ALL ON public.ip_rate_limits TO service_role;
ALTER TABLE public.ip_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.record_ip_action(_ip_address text, _endpoint text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.ip_rate_limits (ip_address, endpoint) VALUES (_ip_address, _endpoint);
  DELETE FROM public.ip_rate_limits WHERE created_at < now() - interval '1 day';
$$;

CREATE OR REPLACE FUNCTION public.check_ip_rate_limit(_ip_address text, _endpoint text, _max_count int, _window_seconds int)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) <= _max_count
  FROM public.ip_rate_limits
  WHERE ip_address = _ip_address
    AND endpoint = _endpoint
    AND created_at > now() - make_interval(secs => _window_seconds);
$$;

-- 4. chat-files storage policies
CREATE POLICY "Users upload own chat files" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'chat-files' AND (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "Authenticated read chat files" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'chat-files');
CREATE POLICY "Users delete own chat files" ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'chat-files' AND (storage.foldername(name))[1] = auth.uid()::text
);