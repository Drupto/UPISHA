'use client'

import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, ExternalLink, Loader2, MailCheck, RefreshCw, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { csrfHeaders } from '@/lib/csrf'
import type { EmailOutboxItem, EmailOutboxStatus } from '@/lib/email-outbox-types'

const FILTERS: Array<{ value: EmailOutboxStatus | 'all'; label: string }> = [
  { value: 'pending_approval', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'sending', label: 'Sending' },
  { value: 'sent', label: 'Sent' },
  { value: 'failed', label: 'Failed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
]

function formatDate(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString()
}

function statusBadge(status: EmailOutboxStatus) {
  const map: Record<EmailOutboxStatus, string> = {
    pending_approval: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    sending: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    sent: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    rejected: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  }
  return map[status]
}

export default function EmailApprovalsPage() {
  const { toast } = useToast()
  const [filter, setFilter] = useState<EmailOutboxStatus | 'all'>('pending_approval')
  const [items, setItems] = useState<EmailOutboxItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const query = filter === 'all' ? '' : `?status=${filter}`
      const res = await fetch(`/api/admin/email-outbox${query}`)
      if (!res.ok) throw new Error('Failed to load email approvals')
      const data = await res.json()
      setItems(data.items || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load email approvals',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [filter, toast])

  useEffect(() => {
    load()
  }, [load])

  const act = async (id: string, action: 'approve' | 'reject' | 'retry') => {
    let body: Record<string, unknown> | undefined
    if (action === 'reject') {
      const reason = window.prompt('Why are you rejecting this email? (required)')
      if (!reason || reason.trim().length < 3) return
      body = { reason: reason.trim() }
    }

    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/email-outbox/${id}/${action}`, {
        method: 'POST',
        headers: csrfHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(body ?? {}),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || `Failed to ${action} email`)

      toast({
        title:
          action === 'approve'
            ? 'Email approved'
            : action === 'reject'
              ? 'Email rejected'
              : 'Email queued for retry',
        description: 'The queue will update shortly.',
      })
      setItems((prev) =>
        action === 'reject'
          ? prev.filter((item) => item.id !== id)
          : prev.map((item) => (item.id === id ? { ...item, status: 'approved' } : item))
      )
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Action failed',
        variant: 'destructive',
      })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-upisha-navy dark:text-white flex items-center gap-2">
            <MailCheck className="h-6 w-6 text-upisha-teal" />
            Email Approvals
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            No transactional email is sent until it is approved here (or created approved by an
            explicit admin action).
          </p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((option) => (
          <Button
            key={option.value}
            size="sm"
            variant={filter === option.value ? 'default' : 'outline'}
            className={filter === option.value ? 'bg-upisha-teal text-white hover:bg-upisha-teal-dark' : ''}
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-upisha-teal" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">
            Nothing in this queue.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={statusBadge(item.status)}>{item.status.replace('_', ' ')}</Badge>
                      <span className="text-sm font-semibold text-upisha-navy dark:text-white">
                        {item.template}
                      </span>
                      {item.attempts > 0 && (
                        <span className="text-xs text-gray-500">attempts: {item.attempts}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 break-all">
                      To: <span className="font-medium">{item.to.name || '—'}</span>{' '}
                      &lt;{item.to.email}&gt;
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Source: {item.source.collection}/{item.source.id} · Requested{' '}
                      {formatDate(item.createdAt)} · By {item.requestedBy.type}
                      {item.requestedBy.email ? ` (${item.requestedBy.email})` : ''}
                    </p>
                    {item.approvedBy && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Approved by {item.approvedBy.email || item.approvedBy.uid} ·{' '}
                        {formatDate(item.approvedAt)}
                      </p>
                    )}
                    {item.rejectionReason && (
                      <p className="text-xs text-red-500">Rejected: {item.rejectionReason}</p>
                    )}
                    {item.lastError && (
                      <p className="text-xs text-red-500 break-all">Last error: {item.lastError}</p>
                    )}
                    <details className="text-xs text-gray-500 dark:text-gray-400">
                      <summary className="cursor-pointer select-none">Template data</summary>
                      <pre className="mt-2 max-h-56 overflow-auto rounded-lg bg-gray-50 p-3 text-[11px] dark:bg-gray-950">
                        {JSON.stringify(item.templateData, null, 2)}
                      </pre>
                    </details>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    {item.status === 'pending_approval' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-upisha-teal text-white hover:bg-upisha-teal-dark"
                          disabled={busyId === item.id}
                          onClick={() => act(item.id, 'approve')}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40"
                          disabled={busyId === item.id}
                          onClick={() => act(item.id, 'reject')}
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </>
                    )}
                    {item.status === 'failed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === item.id}
                        onClick={() => act(item.id, 'retry')}
                      >
                        <RefreshCw className="h-4 w-4" />
                        Retry
                      </Button>
                    )}
                    <span className="inline-flex h-8 items-center gap-1 rounded-md border px-2 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                      <ExternalLink className="h-3 w-3" />
                      {item.source.collection}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
