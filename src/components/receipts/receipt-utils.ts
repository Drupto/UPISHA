/**
 * Shared receipt presentation helpers.
 *
 * These were previously duplicated between ReceiptCard and ReceiptPrintable —
 * keep both importing from here so labels/colors/formatting can never drift.
 */

export const transactionTypeLabels: Record<string, string> = {
  membership: 'Membership',
  webinar: 'Webinar',
  event: 'Event',
  other: 'Other',
}

/** Status chip classes — includes dark-mode variants so badges stay legible. */
export const statusColors: Record<string, string> = {
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  refunded: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

export const statusLabels: Record<string, string> = {
  paid: 'Paid',
  pending: 'Pending',
  refunded: 'Refunded',
}

export function formatReceiptDate(val: Date | string | undefined | null, month: 'short' | 'long' = 'short'): string {
  if (!val) return 'N/A'
  try {
    return new Date(val).toLocaleDateString('en-IN', {
      year: 'numeric',
      month,
      day: 'numeric',
    })
  } catch {
    return 'N/A'
  }
}

export function formatReceiptCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0)
}
