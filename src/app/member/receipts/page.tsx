'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Receipt as ReceiptIcon, IndianRupee } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { ReceiptDoc } from '@/lib/types'
import ReceiptCard from '@/components/receipts/ReceiptCard'

export default function MemberReceipts() {
  const { toast } = useToast()
  const [receipts, setReceipts] = useState<ReceiptDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReceipts()
  }, [])

  // Hoisted function declaration: the effect below calls this before its
  // old const-declaration position (TDZ — React Compiler lint error).
  async function fetchReceipts() {
    try {
      const res = await fetch('/api/receipts/mine')
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

  const totalPaid = receipts
    .filter((r) => r.status === 'paid')
    .reduce((sum, r) => sum + (r.amount || 0), 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

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

  if (receipts.length === 0) {
    return (
      <div className="text-center py-12">
        <ReceiptIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-upisha-navy dark:text-white mb-2">
          No Receipts Yet
        </h2>
        <p className="text-gray-500">
          Your payment receipts will appear here once transactions are confirmed.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-upisha-navy dark:text-white">My Receipts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View and download receipts for your transactions
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
              <p className="text-xl font-bold text-upisha-navy dark:text-white">{formatCurrency(totalPaid)}</p>
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

      {/* Receipt list */}
      <div className="space-y-4">
        {receipts.map((receipt) => (
          <ReceiptCard key={receipt.id} receipt={receipt} />
        ))}
      </div>
    </div>
  )
}