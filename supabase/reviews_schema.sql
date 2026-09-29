-- ============================================================================
-- revivaa — REVIEW SYSTEM (separate schema file)
-- Run AFTER supabase/schema.sql (needs: products, profiles, public.is_admin()).
-- Creates: reviews, review_media, 'review-media' storage bucket, RLS policies,
--          grants, updated_at trigger, idempotent seed data.
-- ============================================================================

-- ———————————————————————————————————————————————————————————————————————————
-- 1. REVIEWS
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  -- NULL for system/influencer rows created by admins; customer rows always
  -- set user_id to the authenticated author.
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  rating integer not null check (rating between 1 and 5),
  title text not null default '',
  body text not null,
  reviewer_type text not null default 'customer'
    check (reviewer_type in ('customer', 'influencer')),
  handle text not null default '',             -- influencer social handle
  featured boolean not null default false,     -- admin-pinned, shown prominently
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  verified_purchase boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reviews_product_idx
  on public.reviews (product_id, status);
create index if not exists reviews_home_idx
  on public.reviews (status, featured desc, created_at desc);

-- ———————————————————————————————————————————————————————————————————————————
-- 2. REVIEW MEDIA (images / videos, uploaded to review-media bucket or URL)
-- ---------------------------------------------------------------------------
create table if not exists public.review_media (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  kind text not null check (kind in ('image', 'video')),
  url text not null,                    -- public bucket URL or external URL
  path text,                            -- storage path (for cleanup), null for URL entries
  poster_url text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists review_media_review_idx
  on public.review_media (review_id, position);

-- ———————————————————————————————————————————————————————————————————————————
-- 3. updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reviews_touch_updated_at on public.reviews;
create trigger reviews_touch_updated_at
  before update on public.reviews
  for each row execute function public.touch_updated_at();

-- ———————————————————————————————————————————————————————————————————————————
-- 4. GRANTS
-- ---------------------------------------------------------------------------
grant select on public.reviews to anon, authenticated;
grant insert, update, delete on public.reviews to authenticated;
grant select on public.review_media to anon, authenticated;
grant insert, update, delete on public.review_media to authenticated;

-- ———————————————————————————————————————————————————————————————————————————
-- 5. RLS — REVIEWS
-- ---------------------------------------------------------------------------
alter table public.reviews enable row level security;

drop policy if exists "Reviews: public read approved" on public.reviews;
create policy "Reviews: public read approved"
  on public.reviews for select
  using (status = 'approved');

drop policy if exists "Reviews: users insert own" on public.reviews;
create policy "Reviews: users insert own"
  on public.reviews for insert
  with check (auth.uid() = user_id and reviewer_type = 'customer');

drop policy if exists "Reviews: users delete own" on public.reviews;
create policy "Reviews: users delete own"
  on public.reviews for delete
  using (auth.uid() = user_id);

drop policy if exists "Reviews: admin manage" on public.reviews;
create policy "Reviews: admin manage"
  on public.reviews for all
  using (public.is_admin())
  with check (public.is_admin());

-- ———————————————————————————————————————————————————————————————————————————
-- 6. RLS — REVIEW MEDIA
-- ---------------------------------------------------------------------------
alter table public.review_media enable row level security;

drop policy if exists "Review media: public read approved" on public.review_media;
create policy "Review media: public read approved"
  on public.review_media for select
  using (
    exists (
      select 1 from public.reviews r
      where r.id = review_media.review_id and r.status = 'approved'
    ) or public.is_admin()
  );

drop policy if exists "Review media: owners insert" on public.review_media;
create policy "Review media: owners insert"
  on public.review_media for insert
  with check (
    exists (
      select 1 from public.reviews r
      where r.id = review_media.review_id and r.user_id = auth.uid()
    ) or public.is_admin()
  );

drop policy if exists "Review media: owners delete" on public.review_media;
create policy "Review media: owners delete"
  on public.review_media for delete
  using (
    exists (
      select 1 from public.reviews r
      where r.id = review_media.review_id and r.user_id = auth.uid()
    ) or public.is_admin()
  );

drop policy if exists "Review media: admin manage" on public.review_media;
create policy "Review media: admin manage"
  on public.review_media for all
  using (public.is_admin())
  with check (public.is_admin());

-- ———————————————————————————————————————————————————————————————————————————
-- 7. STORAGE BUCKET — review-media (public, 200 MB)
-- Folders: {user-id}/{file}. Owners may write their own folder; admins any.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('review-media', 'review-media', true, 209715200)
on conflict (id) do update
  set public = true, file_size_limit = excluded.file_size_limit;

drop policy if exists "review-media: public read" on storage.objects;
create policy "review-media: public read"
  on storage.objects for select using (bucket_id = 'review-media');

drop policy if exists "review-media: owners insert" on storage.objects;
create policy "review-media: owners insert"
  on storage.objects for insert
  with check (
    bucket_id = 'review-media'
    and (
      (auth.role() = 'authenticated'
        and (storage.foldername(name))[1] = auth.uid()::text)
      or public.is_admin()
    )
  );

drop policy if exists "review-media: owners update" on storage.objects;
create policy "review-media: owners update"
  on storage.objects for update
  using (
    bucket_id = 'review-media'
    and (
      (auth.role() = 'authenticated'
        and (storage.foldername(name))[1] = auth.uid()::text)
      or public.is_admin()
    )
  );

drop policy if exists "review-media: owners delete" on storage.objects;
create policy "review-media: owners delete"
  on storage.objects for delete
  using (
    bucket_id = 'review-media'
    and (
      (auth.role() = 'authenticated'
        and (storage.foldername(name))[1] = auth.uid()::text)
      or public.is_admin()
    )
  );

-- ———————————————————————————————————————————————————————————————————————————
-- 8. SEED DATA (idempotent — only inserted once; requires product
--    'revivaa-oil-150' from the main schema to exist)
-- ---------------------------------------------------------------------------
insert into public.reviews
  (id, product_id, user_id, author_name, rating, title, body,
   reviewer_type, handle, featured, status, verified_purchase)
values
  ('00000000-0000-0000-0000-000000000001', 'revivaa-oil-150', null,
   'Ayesha R.', 5, 'My hair actually drinks this',
   'Three weeks in and my ends finally feel alive again. It soaks in fast, no greasy film, and the rosemary note is so soft.',
   'customer', '', true, 'approved', true),
  ('00000000-0000-0000-0000-000000000002', 'revivaa-oil-150', null,
   'Zainab K.', 4, 'Lighter than I feared',
   'I was worried about heaviness but it absorbs quickly on damp hair. Scent is warm and herbal. Would love a bigger size.',
   'customer', '', false, 'approved', false),
  ('00000000-0000-0000-0000-000000000003', 'revivaa-oil-150', null,
   'Hareem · @hareemskincare', 5, 'Reaction reel — full review',
   'The glow-up is visible on camera. This is the only oil that does not coat my strand — it restores. Full reaction reel in my reviews.',
   'influencer', '@hareemskincare', true, 'approved', true)
on conflict (id) do nothing;

insert into public.review_media
  (review_id, kind, url, path, poster_url, position)
values
  ('00000000-0000-0000-0000-000000000003', 'video',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', null, null, 10)
on conflict (id) do nothing;