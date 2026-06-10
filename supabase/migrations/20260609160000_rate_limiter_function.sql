-- ==========================================
-- Rate limiting: Supabase-based rate limiter
-- Replaces the in-memory Map for serverless compatibility
-- ==========================================

-- Rate limiter table: tracks request counts per user per sliding window
CREATE TABLE IF NOT EXISTS public.rate_limiter (
  user_id uuid NOT NULL,
  action_count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, window_start)
);

-- Grant access only to service_role (used by supabaseAdmin)
ALTER TABLE public.rate_limiter ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.rate_limiter TO service_role;
REVOKE ALL ON public.rate_limiter FROM PUBLIC, anon, authenticated;

-- Cleanup old entries periodically
CREATE OR REPLACE FUNCTION public.cleanup_rate_limiter()
RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  DELETE FROM public.rate_limiter
  WHERE window_start < now() - interval '2 minutes';
$$;

-- Revoke EXECUTE from public/anon
REVOKE ALL ON FUNCTION public.cleanup_rate_limiter() FROM PUBLIC, anon;