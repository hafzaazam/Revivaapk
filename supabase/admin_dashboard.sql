-- ============================================================================
-- Revivaa: Admin dashboard analytics
-- Run AFTER schema.sql (and vouchers_schema.sql) in Supabase → SQL Editor.
-- Safe to re-run (idempotent).
--
-- Provides:
--   * admin_dashboard_stats : KPIs, sales/revenue/discount time series, and
--     breakdowns filtered by product / voucher / city / province / category,
--     bucketed per day / week / month / year (or a custom range).
--   * admin_customer_returns: repeat-customer system. A customer is "returning"
--     when an earlier (non-cancelled) order matches on EMAIL, PHONE or ADDRESS
--     (email takes priority as the identity key for counting).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Dashboard stats
-- ---------------------------------------------------------------------------
create or replace function public.admin_dashboard_stats(
  p_date_from timestamptz default null,
  p_date_to timestamptz default null,
  p_granularity text default 'day',
  p_product_id text default null,
  p_category_id uuid default null,
  p_voucher_id uuid default null,
  p_city text default null,
  p_province text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_granularity text := case
    when p_granularity in ('day', 'week', 'month', 'year') then p_granularity
    else 'day'
  end;
  v_from timestamptz := coalesce(p_date_from, '-infinity');
  v_to timestamptz := coalesce(p_date_to, 'infinity');
  v_summary jsonb;
  v_series jsonb;
  v_by_product jsonb;
  v_by_category jsonb;
  v_by_city jsonb;
  v_by_province jsonb;
  v_by_voucher jsonb;
  v_recent jsonb;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  -- Filtered orders (window + any of product/category/voucher/city/province).
  -- is_return: view of the FULL order history (any matching earlier order).
  drop table if exists tmp_dash_o;
  create temp table tmp_dash_o on commit drop as
  select
    o.*,
    lower(trim(o.customer_email)) as email_key,
    regexp_replace(o.customer_phone, '[^0-9]', '', 'g') as phone_key,
    lower(trim(o.customer_address)) as addr_key,
    exists (
      select 1 from public.orders f
      where f.status <> 'cancelled'
        and f.id <> o.id
        and (f.created_at < o.created_at or (f.created_at = o.created_at and f.id < o.id))
        and (
          lower(trim(f.customer_email)) = lower(trim(o.customer_email))
          or (
            length(regexp_replace(o.customer_phone, '[^0-9]', '', 'g')) > 3
            and regexp_replace(f.customer_phone, '[^0-9]', '', 'g')
              = regexp_replace(o.customer_phone, '[^0-9]', '', 'g')
          )
          or (
            length(trim(o.customer_address)) > 5
            and lower(trim(f.customer_address)) = lower(trim(o.customer_address))
          )
        )
    ) as is_return
  from public.orders o
  where o.status <> 'cancelled'
    and o.created_at >= v_from
    and o.created_at <= v_to
    and (
      p_product_id is null
      or exists (
        select 1 from public.order_items oi
        where oi.order_id = o.id and oi.product_id = p_product_id
      )
    )
    and (
      p_category_id is null
      or exists (
        select 1 from public.order_items oi
        join public.products pr on pr.id = oi.product_id
        where oi.order_id = o.id and pr.category_id = p_category_id
      )
    )
    and (p_voucher_id is null or o.voucher_id = p_voucher_id)
    and (p_city is null or lower(o.customer_city) = lower(p_city))
    and (p_province is null or lower(o.customer_province) = lower(p_province));

  -- Summary + customer-return accounting
  select jsonb_build_object(
    'orders', (select count(*) from tmp_dash_o),
    'subtotal', coalesce((select sum(subtotal) from tmp_dash_o), 0),
    'delivery', coalesce((select sum(delivery_charge) from tmp_dash_o), 0),
    'discount', coalesce((select sum(discount) from tmp_dash_o), 0),
    'revenue', coalesce((select sum(total) from tmp_dash_o), 0),
    'uniqueCustomers', (select count(*) from (select distinct email_key from tmp_dash_o) c),
    'returningCustomers', (
      select count(*) from (
        select email_key, bool_or(is_return) as returned
        from tmp_dash_o group by email_key
      ) g where g.returned
    ),
    'newCustomers', (
      select count(*) from (
        select email_key, bool_or(is_return) as returned
        from tmp_dash_o group by email_key
      ) g where not g.returned
    ),
    'returnRate', (
      select round(
        100.0 * count(*)::numeric / nullif((select count(distinct email_key) from tmp_dash_o), 0),
        1
      ) from (
        select email_key, bool_or(is_return) as returned
        from tmp_dash_o group by email_key
      ) g where g.returned
    ),
    'avgOrderValue', (
      select round(coalesce(avg(total), 0), 1) from tmp_dash_o
    ),
    'voucherOrders', (select count(*) from tmp_dash_o where voucher_id is not null),
    'voucherDiscount', coalesce((select sum(discount) from tmp_dash_o where voucher_id is not null), 0)
  ) into v_summary;

  -- Time series
  select coalesce(jsonb_agg(x order by x->>'bucket'), '[]'::jsonb)
  into v_series
  from (
    select jsonb_build_object(
      'bucket', to_char(date_trunc(v_granularity, created_at), 'YYYY-MM-DD'),
      'label', to_char(
        date_trunc(v_granularity, created_at),
        case when v_granularity in ('day', 'week') then 'Mon DD' else 'Mon YYYY' end
      ),
      'orders', count(*),
      'subtotal', sum(subtotal),
      'discount', sum(discount),
      'revenue', sum(total)
    ) as x
    from tmp_dash_o
    group by date_trunc(v_granularity, created_at)
  ) s;

  -- Revenue by product (line totals; one line per order item)
  select coalesce(jsonb_agg(x), '[]'::jsonb)
  into v_by_product
  from (
    select jsonb_build_object(
      'name', pr.name,
      'orders', count(distinct oi.order_id),
      'revenue', sum(oi.line_total)
    ) as x
    from public.order_items oi
    join public.products pr on pr.id = oi.product_id
    where exists (select 1 from tmp_dash_o o where o.id = oi.order_id)
    group by pr.name
    order by sum(oi.line_total) desc
    limit 10
  ) s;

  -- Orders by category
  select coalesce(jsonb_agg(x), '[]'::jsonb)
  into v_by_category
  from (
    select jsonb_build_object(
      'name', coalesce(nullif(c.name, ''), 'Uncategorized'),
      'orders', count(distinct oi.order_id),
      'revenue', sum(oi.line_total)
    ) as x
    from public.order_items oi
    join public.products pr on pr.id = oi.product_id
    left join public.categories c on c.id = pr.category_id
    where exists (select 1 from tmp_dash_o o where o.id = oi.order_id)
    group by coalesce(nullif(c.name, ''), 'Uncategorized')
    order by sum(oi.line_total) desc
    limit 10
  ) s;

  -- Revenue by city / province
  select coalesce(jsonb_agg(x), '[]'::jsonb)
  into v_by_city
  from (
    select jsonb_build_object(
      'name', customer_city,
      'orders', count(*),
      'revenue', sum(total)
    ) as x
    from tmp_dash_o
    group by customer_city
    order by sum(total) desc
    limit 10
  ) s;

  select coalesce(jsonb_agg(x), '[]'::jsonb)
  into v_by_province
  from (
    select jsonb_build_object(
      'name', customer_province,
      'orders', count(*),
      'revenue', sum(total)
    ) as x
    from tmp_dash_o
    group by customer_province
    order by sum(total) desc
    limit 10
  ) s;

  -- Voucher usage + discount
  select coalesce(jsonb_agg(x), '[]'::jsonb)
  into v_by_voucher
  from (
    select jsonb_build_object(
      'code', coalesce(voucher_code, '(no voucher)'),
      'orders', count(*),
      'discount', sum(discount)
    ) as x
    from tmp_dash_o
    where voucher_code is not null
    group by voucher_code
    order by sum(discount) desc
    limit 10
  ) s;

  -- Recent orders (compact)
  select coalesce(jsonb_agg(x), '[]'::jsonb)
  into v_recent
  from (
    select jsonb_build_object(
      'id', id,
      'tracking_code', tracking_code,
      'customer_name', customer_name,
      'customer_city', customer_city,
      'subtotal', subtotal,
      'discount', discount,
      'voucher_code', voucher_code,
      'total', total,
      'status', status,
      'created_at', created_at
    ) as x
    from tmp_dash_o
    order by created_at desc
    limit 12
  ) s;

  drop table tmp_dash_o;

  return jsonb_build_object(
    'summary', v_summary,
    'series', v_series,
    'byProduct', v_by_product,
    'byCategory', v_by_category,
    'byCity', v_by_city,
    'byProvince', v_by_province,
    'byVoucher', v_by_voucher,
    'recentOrders', v_recent,
    'granularity', v_granularity
  );
end;
$$;

revoke all on function public.admin_dashboard_stats from public;
grant execute on function public.admin_dashboard_stats to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Customer returns — who came back, and why they count as returning
-- ---------------------------------------------------------------------------
create or replace function public.admin_customer_returns(
  p_date_from timestamptz default null,
  p_date_to timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_from timestamptz := coalesce(p_date_from, '-infinity');
  v_to timestamptz := coalesce(p_date_to, 'infinity');
  v_rows jsonb;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  select coalesce(jsonb_agg(x), '[]'::jsonb)
  into v_rows
  from (
    select jsonb_build_object(
      'email', email_key,
      'name', (array_agg(customer_name order by created_at desc))[1],
      'phone', (array_agg(customer_phone order by created_at desc))[1],
      'city', (array_agg(customer_city order by created_at desc))[1],
      'province', (array_agg(customer_province order by created_at desc))[1],
      'orders', count(*),
      'returning', bool_or(is_return),
      'firstOrderAt', min(created_at),
      'lastOrderAt', max(created_at),
      'revenue', sum(total)
    ) as x
    from (
      select
        o.*,
        lower(trim(o.customer_email)) as email_key,
        regexp_replace(o.customer_phone, '[^0-9]', '', 'g') as phone_key,
        lower(trim(o.customer_address)) as addr_key,
        exists (
          select 1 from public.orders f
          where f.status <> 'cancelled'
            and f.id <> o.id
            and (f.created_at < o.created_at or (f.created_at = o.created_at and f.id < o.id))
            and (
              lower(trim(f.customer_email)) = lower(trim(o.customer_email))
              or (
                length(regexp_replace(o.customer_phone, '[^0-9]', '', 'g')) > 3
                and regexp_replace(f.customer_phone, '[^0-9]', '', 'g')
                  = regexp_replace(o.customer_phone, '[^0-9]', '', 'g')
              )
              or (
                length(trim(o.customer_address)) > 5
                and lower(trim(f.customer_address)) = lower(trim(o.customer_address))
              )
            )
        ) as is_return
      from public.orders o
      where o.status <> 'cancelled'
        and o.created_at >= v_from
        and o.created_at <= v_to
    ) sub
    group by email_key
    order by sum(total) desc
    limit 50
  ) s;

  return v_rows;
end;
$$;

revoke all on function public.admin_customer_returns from public;
grant execute on function public.admin_customer_returns to authenticated;