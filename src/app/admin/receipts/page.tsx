'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Receipt as ReceiptIcon, IndianRupee, Search } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { csrfHeaders } from '@/lib/csrf'
import type { ReceiptDoc } from '@/lib/types'
import ReceiptCard from '@/components/receipts/ReceiptCard'
import { formatReceiptCurrency } from '@/components/receipts/receipt-utils'

export default function AdminReceipts() {
  const { toast } = useToast()
  const [receipts, setReceipts] = useState<ReceiptDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchReceipts()
  }, [])

  // Hoisted function declaration: the effect below calls this before its
  // old const-declaration position (TDZ — React Compiler lint error).
  async function fetchReceipts() {
    try {
      const res = await fetch('/api/receipts')
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to load receipts')
      }
      const data = await res.json()
      setReceipts(data.receipts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load receipts')
      toast({ title: 'Error', description: 'Failed to load receipts', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (receipt: ReceiptDoc) => {
    if (!receipt.id) return
    if (!confirm(`Delete receipt ${receipt.receiptNumber}? This permanently removes the financial record and cannot be undone.`)) return

    setDeletingId(receipt.id)
    try {
      // DELETE is CSRF-protected server-side (double-submit cookie pattern) —
      // the x-csrf-token header must match the csrf-token cookie or it 403s.
      const res = await fetch(`/api/receipts/${receipt.id}`, {
        method: 'DELETE',
        headers: csrfHeaders(),
      })
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('Session expired or security check failed — refresh the page and try again')
        }
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to delete receipt')
      }
      // Remove locally so the summary cards and count stay consistent.
      setReceipts((prev) => prev.filter((r) => r.id !== receipt.id))
      toast({ title: 'Receipt deleted', description: `Receipt ${receipt.receiptNumber} has been removed.` })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete receipt',
        variant: 'destructive',
      })
    } finally {
      setDeletingId(null)
    }
  }

  const filteredReceipts = receipts.filter((r) => {
    const q = search.toLowerCase()
    if (!q) return true
    return (
      (r.receiptNumber || '').toLowerCase().includes(q) ||
      (r.memberName || '').toLowerCase().includes(q) ||
      (r.memberEmail || '').toLowerCase().includes(q) ||
      (r.description || '').toLowerCase().includes(q) ||
      (r.transactionNumber || '').toLowerCase().includes(q)
    )
  })

  const totalAmount = receipts
    .filter((r) => r.status === 'paid')
    .reduce((sum, r) => sum + (r.amount || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-upisha-teal" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={fetchReceipts} className="text-upisha-teal hover:underline">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-upisha-navy dark:text-white">Receipts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            All payment receipts across the association
          </p>
        </div>
        <Badge className="bg-upisha-teal/10 text-upisha-teal">
          {receipts.length} {receipts.length === 1 ? 'Receipt' : 'Receipts'}
        </Badge>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-upisha-teal/10">
              <IndianRupee className="h-6 w-6 text-upisha-teal" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Paid</p>
              <p className="text-xl font-bold text-upisha-navy dark:text-white">{formatReceiptCurrency(totalAmount)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-indigo-100 text-indigo-600">
              <ReceiptIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Receipts</p>
              <p className="text-xl font-bold text-upisha-navy dark:text-white">{receipts.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by receipt number, member name, email, or transaction ref..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-upisha-teal/50"
        />
      </div>

      {/* Receipt list */}
      {filteredReceipts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <ReceiptIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-upisha-navy dark:text-white mb-2">
            {search ? 'No matching receipts' : 'No Receipts Yet'}
          </h2>
          <p className="text-gray-500">
            {search ? 'Try adjusting your search query.' : 'Receipts will appear here once generated.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReceipts.map((receipt) => (
            <ReceiptCard
              key={receipt.id}
              receipt={receipt}
              onDelete={handleDelete}
              deleting={!!receipt.id && deletingId === receipt.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}