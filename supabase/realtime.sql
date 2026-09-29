-- ============================================================================
-- Revivaa: Realtime for new-order notifications (admin dashboard)
-- ---------------------------------------------------------------------------
-- Run in Supabase → SQL Editor AFTER schema.sql. Safe to re-run.
-- Required: the "supabase_realtime" publication must exist (it does on all
-- Supabase projects — Dashboard → Database → Replication also shows it).
--
-- This lets the admin panel receive live "new order" inserts over a websocket
-- instead of waiting for the 30s polling fallback.
-- ============================================================================

do $$
begin
  begin
    alter publication supabase_realtime add table public.orders, public.order_items;
  exception
    when duplicate_object then
      null; -- already subscribed — ignore
    when undefined_object then
      raise warning
        'supabase_realtime publication not found. Create it in Supabase → Database → Replication, or just rely on polling.';
  end;
end $$;