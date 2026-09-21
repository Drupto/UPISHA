'use client'

import { useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Receipt as ReceiptIcon, Trash2, Loader2 } from 'lucide-react'
import type { ReceiptDoc } from '@/lib/types'
import ReceiptPrintable from './ReceiptPrintable'
import ReceiptDownload from './ReceiptDownload'
import {
  transactionTypeLabels,
  statusColors,
  statusLabels,
  formatReceiptDate,
  formatReceiptCurrency,
} from './receipt-utils'

interface ReceiptCardProps {
  receipt: ReceiptDoc
  /** When provided, a delete action is rendered (admin view only). */
  onDelete?: (receipt: ReceiptDoc) => void
  /** Disables the delete button while its request is in flight. */
  deleting?: boolean
}

export default function ReceiptCard({ receipt, onDelete, deleting }: ReceiptCardProps) {
  const [expanded, setExpanded] = useState(false)
  const receiptRef = useRef<HTMLDivElement | null>(null)

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
              <p className="font-bold text-upisha-teal">{formatReceiptCurrency(receipt.amount)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{formatReceiptDate(receipt.issuedAt)}</p>
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

            <div className="flex justify-between items-center flex-wrap gap-2">
              <ReceiptDownload
                receiptRef={receiptRef}
                fileName={`${receipt.receiptNumber}`}
              />
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(receipt)}
                  disabled={deleting}
                  title="Delete receipt"
                  className="text-red-500 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}