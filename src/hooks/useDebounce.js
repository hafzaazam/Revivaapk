import { useEffect, useState } from 'react'

/**
 * Returns a debounced version of the passed value.
 * Delays updating the debounced value until after `delay` milliseconds
 * have elapsed since the last time the value changed.
 *
 * @template T
 * @param {T} value
 * @param {number} delay (ms)
 * @returns {T}
 */
export function useDebounce(value, delay = 250) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebounce
