
-- 1) One reaction per user per post
DELETE FROM public.post_reactions a
USING public.post_reactions b
WHERE a.ctid < b.ctid AND a.post_id = b.post_id AND a.user_id = b.user_id;

ALTER TABLE public.post_reactions
  DROP CONSTRAINT IF EXISTS post_reactions_post_id_user_id_reaction_key;
ALTER TABLE public.post_reactions
  ADD CONSTRAINT post_reactions_post_user_unique UNIQUE (post_id, user_id);

-- 2) Madness coefficient on posts
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS madness smallint NOT NULL DEFAULT floor(random()*100)::smallint
  CHECK (madness BETWEEN 0 AND 100);

-- 3) User madness preference + chaos mode
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS madness_pref smallint NOT NULL DEFAULT 50
  CHECK (madness_pref BETWEEN 0 AND 100);

-- 4) Trust score
CREATE OR REPLACE FUNCTION public.trust_score(_user_id uuid)
RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT LEAST(100, GREATEST(0, COALESCE(
    (EXTRACT(EPOCH FROM (now() - p.created_at))/86400)::int / 2
    + CASE WHEN p.display_name IS NOT NULL THEN 5 ELSE 0 END
    + CASE WHEN p.avatar_url IS NOT NULL THEN 5 ELSE 0 END
    + (SELECT COUNT(*) FROM public.posts WHERE author_id = _user_id)::int / 2
    + (SELECT COUNT(*) FROM public.follows WHERE followee_id = _user_id)::int
  , 10)))::int
  FROM public.profiles p WHERE p.id = _user_id;
$$;
REVOKE ALL ON FUNCTION public.trust_score(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.trust_score(uuid) TO authenticated;

-- 5) Smart feed RPC: returns post ids in display order
CREATE OR REPLACE FUNCTION public.smart_feed(_mode text DEFAULT 'smart', _limit int DEFAULT 50)
RETURNS TABLE(post_id uuid)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  pref int := COALESCE((SELECT madness_pref FROM public.profiles WHERE id = uid), 50);
BEGIN
  IF uid IS NULL THEN RETURN; END IF;

  IF _mode = 'chaos' THEN
    -- 50% popular, 30% random, 20% from new authors (<7d)
    RETURN QUERY
    WITH pool AS (
      SELECT p.id, p.author_id, p.created_at, p.madness,
        (COALESCE((SELECT COUNT(*) FROM post_reactions r WHERE r.post_id = p.id),0)
         + COALESCE((SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id),0)*2
         + exp(-EXTRACT(EPOCH FROM (now()-p.created_at))/172800)*20)::float AS score,
        EXTRACT(EPOCH FROM (now() - pr.created_at))/86400 AS author_age_days
      FROM posts p JOIN profiles pr ON pr.id = p.author_id
      WHERE p.is_hidden = false AND can_view_private_user(p.author_id)
    ),
    popular AS (SELECT id, author_id FROM pool ORDER BY score DESC LIMIT (_limit/2)),
    randoms AS (SELECT id, author_id FROM pool WHERE id NOT IN (SELECT id FROM popular)
                ORDER BY random() LIMIT (_limit*3/10)),
    newbies AS (SELECT id, author_id FROM pool WHERE author_age_days < 7
                AND id NOT IN (SELECT id FROM popular) AND id NOT IN (SELECT id FROM randoms)
                ORDER BY random() LIMIT (_limit/5)),
    combined AS (
      SELECT id, author_id, random() AS ord FROM popular
      UNION ALL SELECT id, author_id, random() FROM randoms
      UNION ALL SELECT id, author_id, random() FROM newbies
    ),
    capped AS (
      SELECT id, author_id, ord,
        row_number() OVER (PARTITION BY author_id ORDER BY ord) AS rn
      FROM combined
    )
    SELECT id FROM capped WHERE rn <= 2 ORDER BY ord LIMIT _limit;

  ELSIF _mode = 'fresh' THEN
    RETURN QUERY
    SELECT p.id FROM posts p
    WHERE p.is_hidden = false AND can_view_private_user(p.author_id)
    ORDER BY p.created_at DESC LIMIT _limit;

  ELSE
    -- smart: scored, author cap = 2, filtered by madness window (±40 from pref)
    RETURN QUERY
    WITH scored AS (
      SELECT p.id, p.author_id,
        ((COALESCE((SELECT COUNT(*) FROM post_reactions r WHERE r.post_id = p.id),0)::float
          * (1 + public.trust_score(p.author_id)::float/100))
         + COALESCE((SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id),0)*2
         + exp(-EXTRACT(EPOCH FROM (now()-p.created_at))/172800)*15
         - abs(p.madness - pref)*0.1) AS score
      FROM posts p
      WHERE p.is_hidden = false AND can_view_private_user(p.author_id)
        AND p.created_at > now() - interval '30 days'
    ),
    capped AS (
      SELECT id, author_id, score,
        row_number() OVER (PARTITION BY author_id ORDER BY score DESC) AS rn
      FROM scored
    )
    SELECT id FROM capped WHERE rn <= 2 ORDER BY score DESC LIMIT _limit;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.smart_feed(text,int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.smart_feed(text,int) TO authenticated;
