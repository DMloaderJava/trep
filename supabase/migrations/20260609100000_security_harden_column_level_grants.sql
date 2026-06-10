-- ==========================================
-- Security hardening: Column-level UPDATE grants
-- Prevents tampering with non-permitted columns
-- even if RLS policies have bugs
-- ==========================================

-- 1) Reports: only admin-review columns should be updatable
REVOKE UPDATE ON public.reports FROM authenticated;
GRANT UPDATE (status, resolved_by, resolved_at, resolution_note) ON public.reports TO authenticated;

-- 2) Reaction proposals: only review columns should be updatable
REVOKE UPDATE ON public.reaction_proposals FROM authenticated;
GRANT UPDATE (status, reviewed_by, reviewed_at, review_note) ON public.reaction_proposals TO authenticated;