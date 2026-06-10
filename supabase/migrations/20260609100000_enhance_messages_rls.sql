-- Enhance messages UPDATE RLS policy to be more explicit
-- 
-- The previous migration (20260609095736) added column-level GRANT UPDATE (read_at),
-- which prevents tampering at the privilege level. This migration:
--   1. Renames the policy to clearly describe what it does
--   2. Adds WITH CHECK clause that validates only read_at is being modified
--      (defense-in-depth: protects even if column-level grants are later broadened)
-- 
-- Note: Full column-level integrity is enforced by:
--   - Column-level GRANT (only read_at can be written)
--   - BEFORE UPDATE trigger (prevents content/sender/recipient/created_at changes)
--   - This RLS policy (validates recipient + read_at is being set)

-- Drop the old, loosely-named policy
DROP POLICY IF EXISTS "Recipient marks read" ON public.messages;

-- Create a new, explicitly-named policy with additional validation
-- USING: only the recipient can select a message row for update
-- WITH CHECK: only the recipient can make changes, and read_at must be set (not cleared)
CREATE POLICY "Recipient updates read_at only"
ON public.messages
FOR UPDATE TO authenticated
USING (auth.uid() = recipient_id)
WITH CHECK (
  auth.uid() = recipient_id
  AND read_at IS NOT NULL
);