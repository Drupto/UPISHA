'use client'

import { useEffect, useState } from 'react'

interface UseAutoAdvanceOptions {
  /** Interval between automatic advances, in ms. */
  intervalMs: number
  /** When true the timer is paused (e.g. hover-pause). */
  isPaused?: boolean
  /** Disable auto-advance entirely (e.g. single-page carousels). */
  enabled?: boolean
}

/**
 * Shared auto-advance hook for landing-page carousels.
 *
 * The interval is keyed on the current `index`, so any manual navigation
 * (arrows / dots) restarts the countdown — clicking "next" always gives a
 * full `intervalMs` before the next automatic advance, instead of the old
 * behaviour where a pending tick could fire immediately after a manual click.
 *
 * Returns `[index, setIndex]` where `setIndex` accepts either a value or an
 * updater function, mirroring `useState`.
 */
export function useAutoAdvance(
  count: number,
  { intervalMs, isPaused = false, enabled = true }: UseAutoAdvanceOptions,
): [number, (next: number | ((prev: number) => number)) => void] {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!enabled || isPaused || count <= 1) return
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % count)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [count, intervalMs, isPaused, enabled, index])

  return [index, setIndex]
}
