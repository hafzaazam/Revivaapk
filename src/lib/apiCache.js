/**
 * High-performance client-side query cache with TTL, request deduplication,
 * and stale-while-revalidate capability.
 */

const cacheStore = new Map()
const inflightRequests = new Map()

const DEFAULT_TTL_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Cache and deduplicate asynchronous queries.
 *
 * @template T
 * @param {string} key - Unique cache key
 * @param {() => Promise<T>} fetcher - Async function returning data
 * @param {{ ttl?: number, forceRefresh?: boolean }} [options]
 * @returns {Promise<T>}
 */
export async function cachedQuery(key, fetcher, options = {}) {
  const ttl = options.ttl ?? DEFAULT_TTL_MS
  const now = Date.now()

  // Return fresh cached item if within TTL
  if (!options.forceRefresh && cacheStore.has(key)) {
    const entry = cacheStore.get(key)
    if (now - entry.timestamp < ttl) {
      return entry.data
    }
  }

  // Deduplicate inflight requests to prevent duplicate parallel fetches
  if (inflightRequests.has(key)) {
    return inflightRequests.get(key)
  }

  const promise = (async () => {
    try {
      const data = await fetcher()
      // Only cache valid data without errors
      if (data && (!data.error || (data.data && !data.error))) {
        cacheStore.set(key, { data, timestamp: Date.now() })
      }
      return data
    } finally {
      inflightRequests.delete(key)
    }
  })()

  inflightRequests.set(key, promise)
  return promise
}

/**
 * Invalidate a specific cache key or keys matching a regex/prefix.
 * @param {string | RegExp} pattern
 */
export function invalidateCache(pattern) {
  if (typeof pattern === 'string') {
    cacheStore.delete(pattern)
    return
  }
  for (const key of cacheStore.keys()) {
    if (pattern.test(key)) {
      cacheStore.delete(key)
    }
  }
}

/**
 * Clear the entire in-memory cache.
 */
export function clearAllCache() {
  cacheStore.clear()
}
