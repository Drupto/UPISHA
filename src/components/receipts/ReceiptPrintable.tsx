'use client'

import { forwardRef } from 'react'
import type { ReceiptDoc } from '@/lib/types'

interface ReceiptPrintableProps {
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

const ReceiptPrintable = forwardRef<HTMLDivElement, ReceiptPrintableProps>(
  ({ receipt }, ref) => {
    const formatDate = (val: Date | string | undefined | null) => {
      if (!val) return 'N/A'
      try {
        return new Date(val).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
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
      <div ref={ref} className="bg-white text-gray-900 p-8 rounded-lg border border-gray-200 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-upisha-teal pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-white border border-gray-200 shrink-0">
              <img
                src="/images/mainlogo.jpeg"
                alt="UP ISHA Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h2 className="font-bold text-upisha-teal text-lg leading-tight">UP ISHA</h2>
              <p className="text-xs text-gray-500">Uttar Pradesh Indian Speech & Hearing Association</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Receipt</p>
            <p className="font-mono text-sm font-semibold text-upisha-navy">{receipt.receiptNumber}</p>
          </div>
        </div>

        {/* Status */}
        <div className="flex justify-between items-center mb-6">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[receipt.status] || statusColors.paid}`}>
            {(receipt.status || 'paid').toUpperCase()}
          </span>
          <span className="text-xs text-gray-500">Date: {formatDate(receipt.issuedAt)}</span>
        </div>

        {/* Bill To */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Billed To</p>
            <p className="font-semibold text-upisha-navy">{receipt.memberName}</p>
            <p className="text-sm text-gray-600">{receipt.memberEmail}</p>
            <p className="text-xs text-gray-500 mt-1">Member ID: {receipt.memberId}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Transaction Type</p>
            <span className="inline-block bg-upisha-teal/10 text-upisha-teal text-xs font-semibold px-3 py-1 rounded-full">
              {transactionTypeLabels[receipt.transactionType] || 'Other'}
            </span>
          </div>
        </div>

        {/* Items */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-100">
                <td className="px-4 py-3 text-upisha-navy">{receipt.description}</td>
                <td className="px-4 py-3 text-right font-semibold text-upisha-navy">{formatCurrency(receipt.amount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="flex justify-end mb-6">
          <div className="w-full sm:w-64">
            <div className="flex justify-between items-center bg-upisha-teal/5 rounded-lg px-4 py-3">
              <span className="font-semibold text-upisha-navy">Total Paid</span>
              <span className="font-bold text-upisha-teal text-lg">{formatCurrency(receipt.amount)}</span>
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="border-t border-gray-100 pt-4 grid sm:grid-cols-2 gap-2 text-sm">
          {receipt.transactionNumber && (
            <div className="flex justify-between sm:block">
              <span className="text-gray-500 text-xs">Transaction Ref:</span>
              <span className="font-mono text-upisha-navy ml-2">{receipt.transactionNumber}</span>
            </div>
          )}
          {receipt.paymentMethod && (
            <div className="flex justify-between sm:block sm:text-right">
              <span className="text-gray-500 text-xs">Payment Method:</span>
              <span className="text-upisha-navy ml-2">{receipt.paymentMethod}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 mt-6 pt-4 text-center">
          <p className="text-xs text-gray-400">This is a system-generated receipt. No signature required.</p>
          <p className="text-xs text-gray-400 mt-1">UP ISHA — Uttar Pradesh Indian Speech & Hearing Association</p>
        </div>
      </div>
    )
  }
)

ReceiptPrintable.displayName = 'ReceiptPrintable'

export default ReceiptPrintable