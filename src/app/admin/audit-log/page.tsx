'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, ScrollText, Search, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

interface AuditLogEntry {
  id: string
  action: string
  resourceType: string
  resourceId: string
  actorUid: string
  actorEmail: string | null
  ip: string
  userAgent: string | null
  details: Record<string, string | number | boolean | null> | null
  timestamp: string
}

/** Mirrors the actions written by src/lib/audit-log.ts call sites. */
const KNOWN_ACTIONS = [
  'announcement.create', 'announcement.update', 'announcement.delete',
  'auth.logout',
  'campaign.create', 'campaign.update', 'campaign.send', 'campaign.delete',
  'certificate.issue', 'certificate.update', 'certificate.delete',
  'event.create', 'event.update', 'event.delete',
  'gallery.create', 'gallery.update', 'gallery.delete',
  'member.create', 'member.approve', 'member.update', 'member.delete',
  'message.update', 'message.delete',
  'publication.create', 'publication.update', 'publication.delete',
  'receipt.create', 'receipt.update', 'receipt.delete',
  'storage.upload',
  'submission.review', 'submission.delete',
  'subscriber.delete',
  'template.create', 'template.update', 'template.delete',
  'webinar.create', 'webinar.update', 'webinar.delete',
  'webinar_registration.update', 'webinar_registration.delete',
  'webinar_receipt.generate',
]

function actionBadgeClass(action: string): string {
  switch (action.split('.').pop()) {
    case 'delete':
      return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
    case 'create':
    case 'issue':
      return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
    case 'approve':
    case 'generate':
    case 'send':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
    case 'upload':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }
}

export default function AdminAuditLog() {
  const { toast } = useToast()
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)

  // Filters (applied on Apply click)
  const [actionFilter, setActionFilter] = useState('all')
  const [actorEmailInput, setActorEmailInput] = useState('')
  const [fromInput, setFromInput] = useState('')
  const [toInput, setToInput] = useState('')

  const buildQuery = useCallback((pageToken?: string | null) => {
    const params = new URLSearchParams()
    if (actionFilter !== 'all') params.set('action', actionFilter)
    if (actorEmailInput.trim()) params.set('actorEmail', actorEmailInput.trim())
    if (fromInput) params.set('from', new Date(`${fromInput}T00:00:00`).toISOString())
    if (toInput) params.set('to', new Date(`${toInput}T23:59:59.999`).toISOString())
    if (pageToken) params.set('pageToken', pageToken)
    const qs = params.toString()
    return qs ? `?${qs}` : ''
  }, [actionFilter, actorEmailInput, fromInput, toInput])

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    setNextPageToken(null)
    try {
      const res = await fetch(`/api/audit-log${buildQuery()}`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to load audit logs')
      }
      const data = await res.json()
      setLogs(data.logs || [])
      setNextPageToken(data.nextPageToken ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs')
      toast({ title: 'Error', description: 'Failed to load audit logs', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [buildQuery, toast])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])
  const loadMore = async () => {
    if (!nextPageToken) return
    setLoadingMore(true)
    try {
      const res = await fetch(`/api/audit-log${buildQuery(nextPageToken)}`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to load more audit logs')
      }
      const data = await res.json()
      setLogs((prev) => [...prev, ...(data.logs || [])])
      setNextPageToken(data.nextPageToken ?? null)
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to load more audit logs',
        variant: 'destructive',
      })
    } finally {
      setLoadingMore(false)
    }
  }

  const resetFilters = () => {
    setActionFilter('all')
    setActorEmailInput('')
    setFromInput('')
    setToInput('')
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
        <button onClick={fetchLogs} className="text-upisha-teal hover:underline">
          Retry
        </button>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-upisha-navy dark:text-white flex items-center gap-2">
            <ScrollText className="h-6 w-6" />
            Audit Log
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Append-only trail of admin actions — entries can never be edited or deleted from the app.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-64">
              <label className="block text-xs font-medium text-gray-500 mb-1">Action</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  {KNOWN_ACTIONS.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-56">
              <label className="block text-xs font-medium text-gray-500 mb-1">Admin email</label>
              <Input
                type="email"
                placeholder="admin@upisha.in"
                value={actorEmailInput}
                onChange={(e) => setActorEmailInput(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
              <Input type="date" value={fromInput} onChange={(e) => setFromInput(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
              <Input type="date" value={toInput} onChange={(e) => setToInput(e.target.value)} />
            </div>
            <Button size="sm" onClick={fetchLogs}>
              <Search className="h-4 w-4 mr-1" /> Apply
            </Button>
            <Button size="sm" variant="ghost" onClick={resetFilters}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Log table */}
      <Card>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No audit entries match these filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-500 whitespace-nowrap">Time</th>
                    <th className="px-4 py-3 font-medium text-gray-500 whitespace-nowrap">Admin</th>
                    <th className="px-4 py-3 font-medium text-gray-500 whitespace-nowrap">Action</th>
                    <th className="px-4 py-3 font-medium text-gray-500 whitespace-nowrap">Resource</th>
                    <th className="px-4 py-3 font-medium text-gray-500 whitespace-nowrap">IP</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {log.actorEmail ? (
                          <span className="text-gray-800 dark:text-gray-200">{log.actorEmail}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={actionBadgeClass(log.action)} variant="secondary">
                          {log.action}
                        </Badge>
                      </td>
                      <td
                        className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-[220px] truncate"
                        title={log.resourceId}
                      >
                        {log.resourceType}
                        {log.resourceId ? `: ${log.resourceId}` : ''}
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs whitespace-nowrap">
                        {log.ip || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-[320px]">
                        {log.details ? (
                          <code className="text-xs block truncate" title={JSON.stringify(log.details)}>
                            {JSON.stringify(log.details)}
                          </code>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {nextPageToken && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}