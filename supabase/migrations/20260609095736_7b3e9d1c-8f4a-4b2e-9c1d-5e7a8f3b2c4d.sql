-- Restrict UPDATE privileges on messages to read_at column only
-- Previously, GRANT UPDATE was on the entire table, allowing recipients
-- to technically update any column (mitigated only by a trigger).
-- Now column-level privileges enforce the constraint at the SQL level.

REVOKE UPDATE ON public.messages FROM authenticated;
GRANT UPDATE (read_at) ON public.messages TO authenticated;