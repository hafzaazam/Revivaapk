import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { adminFetchOrders } from '../lib/adminApi'
import { playOrderChime } from '../lib/notificationSound'

const POLL_MS = 30000
const MUTE_KEY = 'revivaa-notif-muted'

function toNotification(order) {
  return {
    id: order.id,
    name: order.customer_name,
    city: order.customer_city,
    total: order.total,
    currency: order.currency || 'PKR',
    at: order.created_at || new Date().toISOString(),
  }
}

/**
 * New-order alerting for the admin dashboard.
 * 1. Supabase Realtime (instant, if the orders table is subscribed — see
 *    supabase/realtime.sql); 2. a 30s polling fallback as a safety net.
 * Both paths push through a dedupe set keyed by order id, so a single order
 * never toasts twice.
 */
export function useNewOrders({ orders = [], enabled = true, onNewOrder } = {}) {
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const [muted, setMuted] = useState(() => window.localStorage.getItem(MUTE_KEY) === '1')

  const seen = useRef(new Set())
  const onNewOrderRef = useRef(onNewOrder)
  const mutedRef = useRef(muted)

  useEffect(() => {
    onNewOrderRef.current = onNewOrder
  }, [onNewOrder])

  useEffect(() => {
    mutedRef.current = muted
  }, [muted])

  useEffect(() => {
    orders.forEach((o) => {
      if (o && o.id) seen.current.add(o.id)
    })
  }, [orders])

  const pushNotification = useCallback((order) => {
    setNotifications((prev) => [toNotification(order), ...prev].slice(0, 40))
    setUnread((u) => u + 1)
    if (!mutedRef.current) playOrderChime()
    onNewOrderRef.current?.(order)
  }, [])

  const accept = useCallback((order) => {
    if (!order || seen.current.has(order.id)) return false
    seen.current.add(order.id)
    pushNotification(order)
    return true
  }, [pushNotification])

  /* Realtime — instant */
  useEffect(() => {
    if (!enabled || !supabase) return undefined
    const channel = supabase
      .channel('revivaa-admin-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          accept(payload.new)
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [enabled, accept])

  /* Polling fallback — catches anything realtime misses */
  useEffect(() => {
    if (!enabled) return undefined
    let alive = true
    let timer
    const tick = async () => {
      const { data } = await adminFetchOrders()
      if (!alive || !data) return
      data
        .filter((o) => o && o.status !== 'cancelled')
        .forEach((o) => {
          accept(o)
        })
    }
    timer = setTimeout(tick, POLL_MS)
    const interval = setInterval(tick, POLL_MS)
    return () => {
      alive = false
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [enabled, accept])

  const toggleMuted = useCallback(() => {
    setMuted((prev) => {
      const next = !prev
      window.localStorage.setItem(MUTE_KEY, next ? '1' : '0')
      return next
    })
  }, [])

  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const markAllRead = useCallback(() => {
    setUnread(0)
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
    setUnread(0)
  }, [])

  return {
    notifications,
    unread,
    muted,
    toggleMuted,
    dismissNotification,
    markAllRead,
    clearNotifications,
    markSeen: (id) => seen.current.add(id),
  }
}