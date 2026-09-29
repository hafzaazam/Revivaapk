import { supabase } from './supabase'

const END_OF_DAY = (v) => (v && v.length === 10 ? `${v}T23:59:59` : v)

/**
 * Admin analytics gateway. Both RPCs are security-definer and verify the
 * caller with is_admin() — the client can't read raw analytics.
 */
export async function fetchAdminDashboardStats(filters = {}) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') }
  const { data, error } = await supabase.rpc('admin_dashboard_stats', {
    p_date_from: filters.dateFrom || null,
    p_date_to: END_OF_DAY(filters.dateTo) || null,
    p_granularity: filters.granularity || 'day',
    p_product_id: filters.productId || null,
    p_category_id: filters.categoryId || null,
    p_voucher_id: filters.voucherId || null,
    p_city: filters.city || null,
    p_province: filters.province || null,
  })
  return { data, error }
}

export async function fetchAdminCustomerReturns({ dateFrom = null, dateTo = null } = {}) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') }
  const { data, error } = await supabase.rpc('admin_customer_returns', {
    p_date_from: dateFrom || null,
    p_date_to: END_OF_DAY(dateTo) || null,
  })
  return { data, error }
}