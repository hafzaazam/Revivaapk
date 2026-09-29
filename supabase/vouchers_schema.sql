-- ============================================================================
-- Revivaa: Vouchers (discount codes)
-- Separate schema file — run AFTER schema.sql in Supabase → SQL Editor.
-- Safe to re-run (idempotent).
--
-- Rules enforced here:
--   * Voucher = flat amount (PKR) OR percentage off the cart subtotal.
--   * Optional: min_subtotal, max overall uses (max_uses), max uses per
--     shopper identity (max_per_user).
--   * Per-user guard: count prior redemptions of the SAME voucher where the
--     shopper's email, phone OR address matches the previous order. When that
--     count reaches max_per_user the code is marked "Voucher already redeemed".
--   * All arithmetic (Percent → value) is done server-side by security-definer
--     functions — the client never computes the discount.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Vouchers
-- ---------------------------------------------------------------------------
create table if not exists public.vouchers (
  id uuid primary key default gen_random_uuid(),
  code text not null check (code = upper(trim(code))),
  kind text not null check (kind in ('flat', 'percent')),
  value integer not null check (value > 0),
  min_subtotal integer not null default 0 check (min_subtotal >= 0),
  max_discount integer check (max_discount is null or max_discount > 0),
  max_uses integer check (max_uses is null or max_uses > 0),
  max_per_user integer not null default 1 check (max_per_user > 0),
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists vouchers_code_key
  on public.vouchers (code);

create index if not exists vouchers_active_idx on public.vouchers (is_active);

-- Percent vouchers must be 1–100; flat ones may be any positive amount.
alter table public.vouchers drop constraint if exists vouchers_percent_check;
alter table public.vouchers add constraint vouchers_percent_check
  check (kind <> 'percent' or (value >= 1 and value <= 100));

alter table public.vouchers enable row level security;

drop policy if exists "Vouchers: admin all" on public.vouchers;
create policy "Vouchers: admin all"
  on public.vouchers for all
  using (public.is_admin())
  with check (public.is_admin());

-- Nobody reads the voucher table directly; the storefront always goes through
-- public.validate_voucher / public.place_cart_order (security definer).

-- ---------------------------------------------------------------------------
-- 2. Redemption ledger — powering the per-user "already redeemed" rule.
--    Email/phone/address snapshots are copied from the order at checkout.
-- ---------------------------------------------------------------------------
create table if not exists public.voucher_redemptions (
  id uuid primary key default gen_random_uuid(),
  voucher_id uuid not null references public.vouchers (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  code text not null,
  email text not null,
  phone text not null,
  address text not null,
  discount integer not null check (discount >= 0),
  created_at timestamptz not null default now()
);

create index if not exists voucher_redemptions_voucher_idx
  on public.voucher_redemptions (voucher_id);
create index if not exists voucher_redemptions_email_idx
  on public.voucher_redemptions (lower(email));
create index if not exists voucher_redemptions_phone_idx
  on public.voucher_redemptions (regexp_replace(phone, '[^0-9]', '', 'g'));
create index if not exists voucher_redemptions_address_idx
  on public.voucher_redemptions (lower(trim(address)));

alter table public.voucher_redemptions enable row level security;

drop policy if exists "Voucher redemptions: admin read" on public.voucher_redemptions;
create policy "Voucher redemptions: admin read"
  on public.voucher_redemptions for select
  using (public.is_admin());

-- Inserts happen only via place_cart_order (security definer). No public insert.

-- ---------------------------------------------------------------------------
-- 3. orders: discount snapshot columns
-- ---------------------------------------------------------------------------
alter table public.orders add column if not exists discount integer not null default 0
  check (discount >= 0);
alter table public.orders add column if not exists voucher_id uuid
  references public.vouchers (id) on delete set null;
alter table public.orders add column if not exists voucher_code text;

-- ---------------------------------------------------------------------------
-- 4. updated_at maintenance (reuses public.touch_updated_at from reviews_schema)
-- ---------------------------------------------------------------------------
drop trigger if exists vouchers_touch_updated_at on public.vouchers;
create trigger vouchers_touch_updated_at
  before update on public.vouchers
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 5. Helper: resolve + basic-check a voucher (used by validate + place_order)
-- ---------------------------------------------------------------------------
create or replace function public.resolve_voucher(p_code text)
returns public.vouchers
language plpgsql
security definer
set search_path = public
as $$
declare
  v public.vouchers%rowtype;
begin
  if length(trim(coalesce(p_code, ''))) < 1 then
    raise exception 'Enter a voucher code';
  end if;

  select * into v
  from public.vouchers
  where code = upper(trim(p_code))
  limit 1;

  if not found then
    raise exception 'Voucher not found';
  end if;
  if not v.is_active then
    raise exception 'Voucher is not active';
  end if;
  if v.starts_at is not null and now() < v.starts_at then
    raise exception 'Voucher is not active yet';
  end if;
  if v.expires_at is not null and now() > v.expires_at then
    raise exception 'Voucher has expired';
  end if;

  return v;
end;
$$;

revoke all on function public.resolve_voucher from public;
grant execute on function public.resolve_voucher to authenticated;

-- ---------------------------------------------------------------------------
-- 6. Count how many times this shopper identity already used the voucher
--    (prior orders sharing email, phone OR address with the current one).
-- ---------------------------------------------------------------------------
create or replace function public.voucher_uses_by_identity(
  p_voucher_id uuid,
  p_email text,
  p_phone text,
  p_address text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uses integer;
begin
  select count(*) into v_uses
  from public.voucher_redemptions vr
  where vr.voucher_id = p_voucher_id
    and (
      lower(trim(vr.email)) = lower(trim(coalesce(p_email, '')))
      or regexp_replace(vr.phone, '[^0-9]', '', 'g')
         = regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g')
      or lower(trim(vr.address)) = lower(trim(coalesce(p_address, '')))
    );

  return v_uses;
end;
$$;

revoke all on function public.voucher_uses_by_identity from public;
grant execute on function public.voucher_uses_by_identity to authenticated;

-- ---------------------------------------------------------------------------
-- 7. Compute the discounted amount for a shopper (server-side, public-safe).
--    Returns jsonb only — never the raw voucher table.
-- ---------------------------------------------------------------------------
create or replace function public.validate_voucher(
  p_code text,
  p_subtotal integer,
  p_email text default null,
  p_phone text default null,
  p_address text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v public.vouchers%rowtype;
  v_subtotal integer := greatest(0, coalesce(p_subtotal, 0));
  v_discount integer := 0;
  v_uses integer;
  v_remaining integer := null;
begin
  v := public.resolve_voucher(p_code);

  if v_subtotal < v.min_subtotal then
    raise exception 'Minimum order of % required', v.min_subtotal;
  end if;

  if v.max_uses is not null then
    select count(*) into v_uses from public.voucher_redemptions
    where voucher_id = v.id;
    if v_uses >= v.max_uses then
      raise exception 'Voucher has been fully redeemed';
    end if;
    v_remaining := v.max_uses - v_uses;
  end if;

  if v.max_per_user is not null and v.max_per_user > 0 then
    if public.voucher_uses_by_identity(v.id, p_email, p_phone, p_address) >= v.max_per_user then
      raise exception 'Voucher already redeemed';
    end if;
  end if;

  if v.kind = 'percent' then
    v_discount := floor(v_subtotal * v.value::numeric / 100);
  else
    v_discount := v.value;
  end if;

  if v.max_discount is not null then
    v_discount := least(v_discount, v.max_discount);
  end if;

  v_discount := greatest(0, least(v_discount, v_subtotal));

  return jsonb_build_object(
    'valid', true,
    'code', v.code,
    'kind', v.kind,
    'value', v.value,
    'min_subtotal', v.min_subtotal,
    'max_discount', v.max_discount,
    'max_per_user', v.max_per_user,
    'max_uses', v.max_uses,
    'discount', v_discount,
    'remaining', v_remaining,
    'expires_at', v.expires_at
  );
end;
$$;

revoke all on function public.validate_voucher from public;
grant execute on function public.validate_voucher to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 8. Checkout writ large — add voucher support to place_cart_order.
--    Validates, applies, records the redemption in the same transaction.
-- ---------------------------------------------------------------------------
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
  p_notes text default null,
  p_voucher_code text default null
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
  v_voucher public.vouchers%rowtype;
  v_discount integer := 0;
  v_uses integer;
  v_code text := nullif(upper(trim(coalesce(p_voucher_code, ''))), '');
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

  -- Voucher: resolve + guard while holding the voucher row lock (serializes
  -- redemptions so two checkouts can't both squeeze past the limits).
  if v_code is not null then
    select * into v_voucher
    from public.vouchers
    where code = v_code and is_active = true
    for update;

    if not found then
      raise exception 'Voucher not found';
    end if;
    if v_voucher.starts_at is not null and now() < v_voucher.starts_at then
      raise exception 'Voucher is not active yet';
    end if;
    if v_voucher.expires_at is not null and now() > v_voucher.expires_at then
      raise exception 'Voucher has expired';
    end if;
    if v_subtotal < v_voucher.min_subtotal then
      raise exception 'Minimum order of % required', v_voucher.min_subtotal;
    end if;

    if v_voucher.max_uses is not null then
      select count(*) into v_uses from public.voucher_redemptions
      where voucher_id = v_voucher.id;
      if v_uses >= v_voucher.max_uses then
        raise exception 'Voucher has been fully redeemed';
      end if;
    end if;

    if public.voucher_uses_by_identity(v_voucher.id, p_customer_email, p_customer_phone, p_customer_address) >= v_voucher.max_per_user then
      raise exception 'Voucher already redeemed';
    end if;

    if v_voucher.kind = 'percent' then
      v_discount := floor(v_subtotal * v_voucher.value::numeric / 100);
    else
      v_discount := v_voucher.value;
    end if;
    if v_voucher.max_discount is not null then
      v_discount := least(v_discount, v_voucher.max_discount);
    end if;
    v_discount := greatest(0, least(v_discount, v_subtotal));
  end if;

  insert into public.orders (
    user_id, status, customer_name, customer_email, customer_phone,
    customer_address, customer_province, customer_city, customer_postal_code,
    tracking_code,
    notes, currency, subtotal, delivery_charge, discount, voucher_id, voucher_code, total
  ) values (
    v_user, 'pending', trim(p_customer_name), trim(p_customer_email), trim(p_customer_phone),
    trim(p_customer_address), trim(p_customer_province), trim(p_customer_city),
    nullif(trim(coalesce(p_customer_postal_code, '')), ''),
    v_tracking,
    nullif(trim(coalesce(p_notes, '')), ''),
    v_currency, v_subtotal, v_delivery, v_discount,
    v_voucher.id, v_voucher.code,
    v_subtotal + v_delivery - v_discount
  )
  returning id into v_order_id;

  if v_code is not null then
    insert into public.voucher_redemptions (
      voucher_id, order_id, code, email, phone, address, discount
    ) values (
      v_voucher.id, v_order_id, v_voucher.code,
      trim(p_customer_email),
      regexp_replace(p_customer_phone, '[^0-9]', '', 'g'),
      trim(p_customer_address),
      v_discount
    );
  end if;

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

-- ---------------------------------------------------------------------------
-- 9. Seed demo voucher codes (idempotent)
-- ---------------------------------------------------------------------------
insert into public.vouchers (
  id, code, kind, value, min_subtotal, max_per_user, max_uses, description, is_active
) values
  ('00000000-0000-0000-0000-000000000021', 'FRIEND10', 'percent', 10, 1000, 1, 500, '10% off your order (friend invite)', true),
  ('00000000-0000-0000-0000-000000000022', 'FLAT200',  'flat',    200, 0,    3, 200, 'Rs. 200 off any order — up to 3 per buyer', true)
on conflict (id) do update set
  code = excluded.code,
  kind = excluded.kind,
  value = excluded.value,
  min_subtotal = excluded.min_subtotal,
  max_per_user = excluded.max_per_user,
  max_uses = excluded.max_uses,
  description = excluded.description,
  is_active = excluded.is_active;