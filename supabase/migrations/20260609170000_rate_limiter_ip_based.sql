-- ==========================================
-- Rate limiting: IP-based rate limit table
-- For public endpoints (login, signup) where user is not yet authenticated
-- ==========================================

CREATE TABLE IF NOT EXISTS public.ip_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  endpoint text NOT NULL DEFAULT 'default',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ip_rate_limits_lookup
  ON public.ip_rate_limits (ip_address, endpoint, created_at);

-- Cleanup old entries automatically (older than 1 hour)
CREATE INDEX IF NOT EXISTS idx_ip_rate_limits_cleanup
  ON public.ip_rate_limits (created_at);

-- Grant access only to service_role
ALTER TABLE public.ip_rate_limits ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.ip_rate_limits TO service_role;
REVOKE ALL ON public.ip_rate_limits FROM PUBLIC, anon, authenticated;

-- ==========================================
-- Function: check_ip_rate_limit
-- Checks if an IP address has exceeded the rate limit for a given endpoint.
-- Returns true if the request is allowed, false if rate limited.
-- ==========================================
CREATE OR REPLACE FUNCTION public.check_ip_rate_limit(
  _ip_address text,
  _endpoint text DEFAULT 'default',
  _max_count int DEFAULT 5,
  _window_seconds int DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  _count int;
  _window_start timestamptz;
BEGIN
  _window_start := now() - make_interval(secs := _window_seconds);

  -- Count recent actions
  SELECT count(*) INTO _count
  FROM public.ip_rate_limits
  WHERE ip_address = _ip_address
    AND endpoint = _endpoint
    AND created_at >= _window_start;

  RETURN _count < _max_count;
END;
$$;

-- ==========================================
-- Function: record_ip_action
-- Records an action for IP-based rate limiting.
-- Call BEFORE check_ip_rate_limit (optimistic insert) or after.
-- ==========================================
CREATE OR REPLACE FUNCTION public.record_ip_action(
  _ip_address text,
  _endpoint text DEFAULT 'default'
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.ip_rate_limits (ip_address, endpoint)
  VALUES (_ip_address, _endpoint);
END;
$$;

-- ==========================================
-- Cleanup job: remove entries older than 1 hour
-- Can be called periodically via pg_cron or manually
-- ==========================================
CREATE OR REPLACE FUNCTION public.cleanup_ip_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  DELETE FROM public.ip_rate_limits
  WHERE created_at < now() - interval '1 hour';
$$;

-- Revoke EXECUTE from anon/authenticated
REVOKE ALL ON FUNCTION public.check_ip_rate_limit(text, text, int, int) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.record_ip_action(text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.cleanup_ip_rate_limits() FROM PUBLIC, anon;

-- Grant to service_role only
GRANT ALL ON FUNCTION public.check_ip_rate_limit(text, text, int, int) TO service_role;
GRANT ALL ON FUNCTION public.record_ip_action(text, text) TO service_role;
GRANT ALL ON FUNCTION public.cleanup_ip_rate_limits() TO service_role;