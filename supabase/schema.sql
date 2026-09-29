-- Revivaa shop schema (auth optional for shoppers + admin panel)
-- Run in Supabase → SQL Editor (safe to re-run)

create extension if not exists "pgcrypto";

-- ——— Profiles ———
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  city text,
  role text not null default 'customer'
    check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Upgrade existing installs
alter table public.profiles
  add column if not exists role text;

update public.profiles
set role = coalesce(nullif(role, ''), 'customer')
where role is null or role = '';

alter table public.profiles
  alter column role set default 'customer';

do $$
begin
  alter table public.profiles
    add constraint profiles_role_check
    check (role in ('customer', 'admin'));
exception
  when duplicate_object then null;
end $$;

alter table public.profiles enable row level security;

drop policy if exists "Profiles: read own" on public.profiles;
drop policy if exists "Profiles: insert own" on public.profiles;
drop policy if exists "Profiles: update own" on public.profiles;
drop policy if exists "Profiles: admin read all" on public.profiles;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

create policy "Profiles: read own"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Profiles: insert own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Profiles: update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto profile; promote known admin email
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text := 'customer';
begin
  if lower(coalesce(new.email, '')) = 'admin@gmail.com' then
    v_role := 'admin';
  end if;

  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    v_role
  )
  on conflict (id) do update
    set role = excluded.role
    where excluded.role = 'admin';

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Promote admin if user already exists
update public.profiles p
set role = 'admin'
from auth.users u
where p.id = u.id
  and lower(u.email) = 'admin@gmail.com';

-- ——— Products ———
create table if not exists public.products (
  id text primary key,
  name text not null,
  subtitle text,
  description text,
  image_url text,
  pack_image_url text,
  unit_price integer not null check (unit_price >= 0),
  currency text not null default 'PKR',
  stock integer not null default 100 check (stock >= 0),
  active boolean not null default true,
  min_qty integer not null default 1,
  max_qty integer not null default 12,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "Products: public read active" on public.products;
drop policy if exists "Products: admin manage" on public.products;

create policy "Products: public read active"
  on public.products for select
  using (active = true or public.is_admin());

create policy "Products: admin manage"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.products (
  id, name, subtitle, description, image_url, pack_image_url,
  unit_price, currency, stock, active, min_qty, max_qty
) values (
  'revivaa-oil-150',
  'Revivaa Oil',
  'Soft & Natural · 150ml',
  'Premium botanical oil — soft, natural care in every drop.',
  '/images/product-bottle.png',
  '/images/product-pack.png',
  2499,
  'PKR',
  200,
  true,
  1,
  12
)
on conflict (id) do update set
  name = excluded.name,
  subtitle = excluded.subtitle,
  description = excluded.description,
  image_url = excluded.image_url,
  pack_image_url = excluded.pack_image_url,
  unit_price = excluded.unit_price,
  currency = excluded.currency,
  min_qty = excluded.min_qty,
  max_qty = excluded.max_qty,
  active = excluded.active;

-- ——— Orders (guest checkout: user_id optional) ———
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  customer_city text not null,
  notes text,
  currency text not null default 'PKR',
  subtotal integer not null check (subtotal >= 0),
  total integer not null check (total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Allow guest orders on existing installs
do $$
begin
  alter table public.orders alter column user_id drop not null;
exception
  when others then null;
end $$;

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

alter table public.orders enable row level security;

drop policy if exists "Orders: read own" on public.orders;
drop policy if exists "Orders: insert own" on public.orders;
drop policy if exists "Orders: admin read all" on public.orders;
drop policy if exists "Orders: admin update" on public.orders;

create policy "Orders: read own"
  on public.orders for select
  using (auth.uid() is not null and auth.uid() = user_id);

create policy "Orders: admin read all"
  on public.orders for select
  using (public.is_admin());

create policy "Orders: admin update"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());

-- ——— Order line items ———
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id text not null references public.products (id),
  product_name text not null,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total integer not null check (line_total >= 0)
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

alter table public.order_items enable row level security;

drop policy if exists "Order items: read own" on public.order_items;
drop policy if exists "Order items: insert own" on public.order_items;
drop policy if exists "Order items: admin read all" on public.order_items;

create policy "Order items: read own"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.user_id is not null
        and o.user_id = auth.uid()
    )
  );

create policy "Order items: admin read all"
  on public.order_items for select
  using (public.is_admin());

-- Delivery details + flat shipping + tracking on existing installs
alter table public.orders add column if not exists customer_address text;
alter table public.orders add column if not exists customer_province text;
alter table public.orders add column if not exists customer_postal_code text;
alter table public.orders add column if not exists delivery_charge integer not null default 299
  check (delivery_charge >= 0);
alter table public.orders add column if not exists tracking_code text;
create unique index if not exists orders_tracking_code_key
  on public.orders (lower(tracking_code))
  where tracking_code is not null;

-- ——— Guest-friendly place_order (security definer) ———
create or replace function public.place_order(
  p_product_id text,
  p_quantity integer,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_customer_city text,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_product public.products%rowtype;
  v_qty integer;
  v_subtotal integer;
  v_order_id uuid;
begin
  if length(trim(coalesce(p_customer_name, ''))) < 2 then
    raise exception 'Name is required';
  end if;
  if length(trim(coalesce(p_customer_email, ''))) < 3 then
    raise exception 'Email is required';
  end if;
  if length(trim(coalesce(p_customer_phone, ''))) < 5 then
    raise exception 'Phone is required';
  end if;
  if length(trim(coalesce(p_customer_city, ''))) < 2 then
    raise exception 'City is required';
  end if;

  select * into v_product
  from public.products
  where id = p_product_id and active = true
  for update;

  if not found then
    raise exception 'Product not found';
  end if;

  v_qty := greatest(v_product.min_qty, least(v_product.max_qty, p_quantity));

  if v_product.stock < v_qty then
    raise exception 'Not enough stock';
  end if;

  v_subtotal := v_product.unit_price * v_qty;

  insert into public.orders (
    user_id, status, customer_name, customer_email, customer_phone,
    customer_city, notes, currency, subtotal, total
  ) values (
    v_user, 'pending', trim(p_customer_name), trim(p_customer_email), trim(p_customer_phone),
    trim(p_customer_city), nullif(trim(coalesce(p_notes, '')), ''),
    v_product.currency, v_subtotal, v_subtotal
  )
  returning id into v_order_id;

  insert into public.order_items (
    order_id, product_id, product_name, unit_price, quantity, line_total
  ) values (
    v_order_id, v_product.id, v_product.name, v_product.unit_price, v_qty, v_subtotal
  );

  update public.products
  set stock = stock - v_qty
  where id = v_product.id;

  return v_order_id;
end;
$$;

revoke all on function public.place_order from public;
grant execute on function public.place_order to anon, authenticated;

-- ——— Admin: update order status ———
create or replace function public.admin_update_order_status(
  p_order_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  if p_status not in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') then
    raise exception 'Invalid status';
  end if;

  update public.orders
  set status = p_status, updated_at = now()
  where id = p_order_id;

  if not found then
    raise exception 'Order not found';
  end if;
end;
$$;

revoke all on function public.admin_update_order_status from public;
grant execute on function public.admin_update_order_status to authenticated;

-- ——— Admin: update product ———
create or replace function public.admin_update_product(
  p_product_id text,
  p_unit_price integer default null,
  p_stock integer default null,
  p_active boolean default null,
  p_name text default null,
  p_subtitle text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  update public.products
  set
    unit_price = coalesce(p_unit_price, unit_price),
    stock = coalesce(p_stock, stock),
    active = coalesce(p_active, active),
    name = coalesce(nullif(trim(p_name), ''), name),
    subtitle = coalesce(p_subtitle, subtitle)
  where id = p_product_id;

  if not found then
    raise exception 'Product not found';
  end if;
end;
$$;

revoke all on function public.admin_update_product from public;
grant execute on function public.admin_update_product to authenticated;

-- ——— Categories (with SEO + spec list + parent/child) ———
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories (id) on delete set null,
  name text not null,
  slug text not null unique,
  title text,
  description text,
  spec_list jsonb not null default '[]'::jsonb,
  meta_title text,
  meta_description text,
  meta_keywords text,
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists categories_parent_idx on public.categories (parent_id);

alter table public.categories enable row level security;

drop policy if exists "Categories: public read active" on public.categories;
drop policy if exists "Categories: admin manage" on public.categories;

create policy "Categories: public read active"
  on public.categories for select
  using (active = true or public.is_admin());

create policy "Categories: admin manage"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- ——— Products: SEO / meta / specs / tags / sale / draft / stock (-1 = infinite) ———
alter table public.products add column if not exists slug text;
alter table public.products add column if not exists category_id uuid references public.categories (id) on delete set null;
alter table public.products add column if not exists meta_title text;
alter table public.products add column if not exists meta_description text;
alter table public.products add column if not exists meta_keywords text;
alter table public.products add column if not exists spec_list jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists sale_price integer;
alter table public.products add column if not exists featured boolean not null default false;
alter table public.products add column if not exists is_new boolean not null default false;
alter table public.products add column if not exists best_seller boolean not null default false;
alter table public.products add column if not exists draft boolean not null default false;
alter table public.products add column if not exists low_stock_threshold integer not null default 10;
alter table public.products add column if not exists video_url text;
alter table public.products add column if not exists sort_order integer not null default 0;

alter table public.products add column if not exists min_qty integer not null default 1;
alter table public.products add column if not exists max_qty integer not null default 12;

-- stock: -1 = unlimited, otherwise >= 0
alter table public.products drop constraint if exists products_stock_check;
alter table public.products add constraint products_stock_check check (stock = -1 or stock >= 0);

alter table public.products drop constraint if exists products_sale_price_check;
alter table public.products add constraint products_sale_price_check check (sale_price is null or sale_price >= 0);

create unique index if not exists products_slug_idx on public.products (slug)
  where slug is not null;

create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_active_draft_idx on public.products (active, draft);

-- Public must NOT see drafts or inactive products
drop policy if exists "Products: public read active" on public.products;
create policy "Products: public read active"
  on public.products for select
  using ((active = true and draft = false) or public.is_admin());

-- ——— Product variations (size) ———
create table if not exists public.product_variations (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products (id) on delete cascade,
  size text not null,
  price integer not null check (price >= 0),
  sale_price integer check (sale_price is null or sale_price >= 0),
  stock integer not null default -1 check (stock = -1 or stock >= 0),
  position integer not null default 0
);

create index if not exists product_variations_product_idx on public.product_variations (product_id);

alter table public.product_variations enable row level security;

drop policy if exists "Product variations: public read active" on public.product_variations;
drop policy if exists "Product variations: admin manage" on public.product_variations;

create policy "Product variations: public read active"
  on public.product_variations for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_variations.product_id
        and p.active = true and p.draft = false
    ) or public.is_admin()
  );

create policy "Product variations: admin manage"
  on public.product_variations for all
  using (public.is_admin())
  with check (public.is_admin());

-- ——— Product media (gallery images + video) ———
create table if not exists public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products (id) on delete cascade,
  kind text not null default 'image' check (kind in ('image', 'video')),
  url text not null,
  alt text,
  label text,
  poster_url text,
  position integer not null default 0
);

create index if not exists product_media_product_idx on public.product_media (product_id);

alter table public.product_media enable row level security;

drop policy if exists "Product media: public read active" on public.product_media;
drop policy if exists "Product media: admin manage" on public.product_media;

create policy "Product media: public read active"
  on public.product_media for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_media.product_id
        and p.active = true and p.draft = false
    ) or public.is_admin()
  );

create policy "Product media: admin manage"
  on public.product_media for all
  using (public.is_admin())
  with check (public.is_admin());

-- —— Seed categories (safe to re-run) ——
insert into public.categories (name, slug, title, description, spec_list, meta_title, meta_keywords, position) values
  ('Hair Oils', 'hair-oils', 'Hair Oils', 'Botanical hair oils for soft, natural care.', '[{"label":"Base","value":"Botanical oils"},{"label":"Format","value":"Glass bottle"}]', 'Hair Oils · revivaa', 'hair oil, botanical oil, natural hair care', 10),
  ('Skin Care', 'skin-care', 'Skin Care', 'Gentle plant-powered formulas for all skin types.', '[{"label":"Base","value":"Plant powered"},{"label":"Feel","value":"Non-greasy"}]', 'Skin Care · revivaa', 'skin care, natural, gentle', 20),
  ('Hair Oils › Revivaa', 'hair-oils-revivaa', 'Revivaa Hair Oil', 'The signature soft & natural Revivaa ritual.', '[{"label":"Size","value":"150ml"},{"label":"Promise","value":"Premium quality"}]', 'Revivaa Hair Oil · revivaa', 'revivaa oil, soft natural hair oil', 30)
on conflict (slug) do nothing;

-- Seed parent→child: Revivaa under Hair Oils
update public.categories c
set parent_id = p.id
from public.categories p
where p.slug = 'hair-oils'
  and c.slug = 'hair-oils-revivaa'
  and c.parent_id is null;

-- Give the seeded product its slug/category + variation + gallery
update public.products p
set
  slug = 'revivaa-oil-150',
  meta_title = 'Revivaa Oil 150ml · Soft & Natural Hair Oil',
  meta_description = 'Premium botanical hair oil. Soft, natural care in a 150ml bottle.',
  meta_keywords = 'revivaa, hair oil, botanical oil, natural, soft, 150ml',
  spec_list = '[{"label":"Volume","value":"150 ml"},{"label":"Finish","value":"Soft & natural"},{"label":"Promise","value":"Premium quality"}]',
  low_stock_threshold = 15,
  sort_order = 10,
  category_id = (select id from public.categories where slug = 'hair-oils-revivaa' limit 1),
  is_new = true,
  best_seller = true
where id = 'revivaa-oil-150';

insert into public.product_variations (id, product_id, size, price, sale_price, stock, position) values
  ('00000000-0000-0000-0000-000000000001', 'revivaa-oil-150', '150 ml', 2499, 2299, 200, 10),
  ('00000000-0000-0000-0000-000000000002', 'revivaa-oil-150', '210 ml', 3299, null, -1, 20)
on conflict (id) do nothing;

insert into public.product_media (id, product_id, kind, url, alt, label, poster_url, position) values
  ('00000000-0000-0000-0000-000000000011', 'revivaa-oil-150', 'image', '/images/product-bottle.png', 'Revivaa Oil 150ml bottle with pump', 'Bottle', null, 10),
  ('00000000-0000-0000-0000-000000000012', 'revivaa-oil-150', 'image', '/images/product-pack.png', 'Revivaa Oil bottle with olive packaging box', 'Pack', null, 20),
  ('00000000-0000-0000-0000-000000000013', 'revivaa-oil-150', 'image', '/images/box.png', 'Revivaa Oil gift box', 'Box', null, 30)
on conflict (id) do nothing;

-- ——— Storage: public bucket for product images + videos ———
insert into storage.buckets (id, name, public, file_size_limit)
values ('product-media', 'product-media', true, 209715200)
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit;

drop policy if exists "product-media: public read" on storage.objects;
drop policy if exists "product-media: admin insert" on storage.objects;
drop policy if exists "product-media: admin update" on storage.objects;
drop policy if exists "product-media: admin delete" on storage.objects;

create policy "product-media: public read"
  on storage.objects for select
  using (bucket_id = 'product-media');

create policy "product-media: admin insert"
  on storage.objects for insert
  with check (bucket_id = 'product-media' and public.is_admin());

create policy "product-media: admin update"
  on storage.objects for update
  using (bucket_id = 'product-media' and public.is_admin());

create policy "product-media: admin delete"
  on storage.objects for delete
  using (bucket_id = 'product-media' and public.is_admin());

-- ——— Cart checkout (multi-line, guest + signed in) ———
drop function if exists public.place_cart_order;
create or replace function public.place_cart_order(
  p_lines jsonb,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_customer_address text,
  p_customer_province text,
  p_customer_city text,
  p_customer_postal_code text default null,
  p_notes text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  r record;
  v_pid text;
  v_vid uuid;
  v_qty integer;
  v_price integer;
  v_currency text := 'PKR';
  v_subtotal integer := 0;
  v_delivery integer := 299;
  v_tracking text := 'RVN-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  v_order_id uuid;
  v_product public.products%rowtype;
  v_var public.product_variations%rowtype;
begin
  if p_lines is null or jsonb_array_length(p_lines) = 0 then
    raise exception 'Cart is empty';
  end if;
  if length(trim(coalesce(p_customer_name, ''))) < 2 then
    raise exception 'Name is required';
  end if;
  if length(trim(coalesce(p_customer_email, ''))) < 3 then
    raise exception 'Email is required';
  end if;
  if p_customer_phone !~ '^03[0-9]{9}$' then
    raise exception 'Enter a valid 03XXXXXXXXX phone number';
  end if;
  if length(trim(coalesce(p_customer_address, ''))) < 5 then
    raise exception 'Street address is required';
  end if;
  if length(trim(coalesce(p_customer_province, ''))) < 2 then
    raise exception 'Province is required';
  end if;
  if length(trim(coalesce(p_customer_city, ''))) < 2 then
    raise exception 'City is required';
  end if;

  -- Pass 1: validate + price everything
  for r in select value as j from jsonb_array_elements(p_lines) loop
    v_pid := r.j->>'product_id';
    v_vid := nullif(r.j->>'variation_id', '')::uuid;
    v_qty := (r.j->>'quantity')::integer;
    if v_qty is null or v_qty < 1 then
      raise exception 'Invalid quantity';
    end if;

    select * into v_product
    from public.products
    where id = v_pid and active = true and draft = false
    for update;

    if not found then
      raise exception 'Product not found';
    end if;

    v_qty := greatest(v_product.min_qty, least(v_product.max_qty, v_qty));
    v_currency := v_product.currency;

    if v_vid is not null then
      select * into v_var
      from public.product_variations
      where id = v_vid and product_id = v_product.id
      for update;

      if not found then
        raise exception 'Variation not found';
      end if;

      v_price := coalesce(v_var.sale_price, v_var.price);
      if v_var.stock = 0 or (v_var.stock > 0 and v_var.stock < v_qty) then
        raise exception 'Not enough stock';
      end if;
    else
      v_price := coalesce(v_product.sale_price, v_product.unit_price);
      if v_product.stock = 0 or (v_product.stock > 0 and v_product.stock < v_qty) then
        raise exception 'Not enough stock';
      end if;
    end if;

    v_subtotal := v_subtotal + v_price * v_qty;
  end loop;

  insert into public.orders (
    user_id, status, customer_name, customer_email, customer_phone,
    customer_address, customer_province, customer_city, customer_postal_code,
    tracking_code,
    notes, currency, subtotal, delivery_charge, total
  ) values (
    v_user, 'pending', trim(p_customer_name), trim(p_customer_email), trim(p_customer_phone),
    trim(p_customer_address), trim(p_customer_province), trim(p_customer_city),
    nullif(trim(coalesce(p_customer_postal_code, '')), ''),
    v_tracking,
    nullif(trim(coalesce(p_notes, '')), ''),
    v_currency, v_subtotal, v_delivery, v_subtotal + v_delivery
  )
  returning id into v_order_id;

  -- Pass 2: write lines + decrement stock
  for r in select value as j from jsonb_array_elements(p_lines) loop
    v_pid := r.j->>'product_id';
    v_vid := nullif(r.j->>'variation_id', '')::uuid;
    v_qty := (r.j->>'quantity')::integer;

    select * into v_product
    from public.products
    where id = v_pid and active = true and draft = false
    for update;

    v_qty := greatest(v_product.min_qty, least(v_product.max_qty, v_qty));

    if v_vid is not null then
      select * into v_var
      from public.product_variations
      where id = v_vid and product_id = v_product.id
      for update;

      v_price := coalesce(v_var.sale_price, v_var.price);

      update public.product_variations
      set stock = stock - v_qty
      where id = v_vid and stock > 0;
    else
      v_price := coalesce(v_product.sale_price, v_product.unit_price);

      update public.products
      set stock = stock - v_qty
      where id = v_pid and stock > 0;
    end if;

    insert into public.order_items (
      order_id, product_id, product_name, unit_price, quantity, line_total
    ) values (
      v_order_id, v_product.id, v_product.name, v_price, v_qty, v_price * v_qty
    );
  end loop;

  return v_tracking;
end;
$$;

revoke all on function public.place_cart_order from public;
grant execute on function public.place_cart_order to anon, authenticated;

-- ——— Public: look up order status by tracking ID ———
create or replace function public.get_order_status(p_tracking_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_items jsonb;
begin
  if length(trim(coalesce(p_tracking_code, ''))) < 4 then
    raise exception 'Enter your tracking ID';
  end if;

  select * into v_order
  from public.orders
  where lower(tracking_code) = lower(trim(p_tracking_code))
  limit 1;

  if not found then
    raise exception 'Order not found';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'product_name', product_name,
    'unit_price', unit_price,
    'quantity', quantity,
    'line_total', line_total
  )), '[]'::jsonb)
  into v_items
  from public.order_items
  where order_id = v_order.id;

  return jsonb_build_object(
    'id', v_order.id,
    'tracking_code', v_order.tracking_code,
    'status', v_order.status,
    'customer_name', v_order.customer_name,
    'customer_city', v_order.customer_city,
    'currency', v_order.currency,
    'subtotal', v_order.subtotal,
    'delivery_charge', v_order.delivery_charge,
    'total', v_order.total,
    'created_at', v_order.created_at,
    'items', v_items
  );
end;
$$;

revoke all on function public.get_order_status from public;
grant execute on function public.get_order_status to anon, authenticated;
