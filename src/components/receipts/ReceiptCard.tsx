'use client'

import { useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, Receipt as ReceiptIcon } from 'lucide-react'
import type { ReceiptDoc } from '@/lib/types'
import ReceiptPrintable from './ReceiptPrintable'
import ReceiptDownload from './ReceiptDownload'

interface ReceiptCardProps {
  receipt: ReceiptDoc
}

const transactionTypeLabels: Record<string, string> = {
  membership: 'Membership',
  webinar: 'Webinar',
  event: 'Event',
  other: 'Other',
}

const statusColors: Record<string, string> = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  refunded: 'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
  paid: 'Paid',
  pending: 'Pending',
  refunded: 'Refunded',
}

export default function ReceiptCard({ receipt }: ReceiptCardProps) {
  const [expanded, setExpanded] = useState(false)
  const receiptRef = useRef<HTMLDivElement | null>(null)

  const formatDate = (val: Date | string | undefined | null) => {
    if (!val) return 'N/A'
    try {
      return new Date(val).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return 'N/A'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
      <CardContent className="p-4">
        {/* Summary row */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between gap-4 text-left"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-upisha-teal/10 flex items-center justify-center shrink-0">
              <ReceiptIcon className="h-5 w-5 text-upisha-teal" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-upisha-navy dark:text-white truncate">{receipt.description}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{receipt.receiptNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="font-bold text-upisha-teal">{formatCurrency(receipt.amount)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(receipt.issuedAt)}</p>
            </div>
            <Badge className={statusColors[receipt.status] || statusColors.paid}>
              {statusLabels[receipt.status] || 'Paid'}
            </Badge>
            <span className="text-xs text-gray-400 hidden sm:inline-block">
              {transactionTypeLabels[receipt.transactionType] || 'Other'}
            </span>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </button>

        {/* Expanded detail */}
        {expanded && (
          <div className="mt-4 pt-4 border-t dark:border-gray-700">
            <div className="grid sm:grid-cols-2 gap-2 text-sm mb-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Transaction Ref</p>
                <p className="font-mono text-upisha-navy dark:text-white">{receipt.transactionNumber || 'N/A'}</p>
              </div>
            </div>

            <div className="mb-4">
              <ReceiptPrintable receipt={receipt} ref={receiptRef} />
            </div>

            <div className="flex justify-end">
              <ReceiptDownload
                receiptRef={receiptRef}
                fileName={`${receipt.receiptNumber}`}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}