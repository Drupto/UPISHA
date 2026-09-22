'use client'

import { useState, useEffect } from 'react'
import {
  GraduationCap, Trash2, Search, Loader2, Mail,
  Phone, ExternalLink, CheckCircle2, Clock, XCircle, MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { csrfHeaders } from '@/lib/csrf'

interface TeachRequest {
  id: string
  name: string
  email: string
  phone: string
  qualification: string
  expertise: string
  topic: string
  experience: string
  format: string
  city?: string | null
  links?: string | null
  message?: string | null
  status: 'new' | 'contacted' | 'accepted' | 'rejected'
  adminNotes?: string | null
  isRead?: boolean
  createdAt?: string | Date | null
}

const STATUS_META: Record<TeachRequest['status'], { label: string; cls: string; icon: typeof Clock }> = {
  new: { label: 'New', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', icon: Clock },
  contacted: { label: 'Contacted', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: Mail },
  accepted: { label: 'Accepted', cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', icon: CheckCircle2 },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', icon: XCircle },
}

export default function AdminTeachRequestsPage() {
  const { toast } = useToast()
  const [requests, setRequests] = useState<TeachRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState<TeachRequest | null>(null)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/teach-requests')
      if (res.ok) {
        const data = await res.json()
        setRequests(data.requests || [])
      } else {
        toast({ title: 'Error', description: 'Failed to load teach requests', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const patchRequest = async (id: string, body: Record<string, unknown>) => {
    const res = await fetch(`/api/teach-requests/${id}`, {
      method: 'PATCH',
      headers: csrfHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error('update failed')
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await patchRequest(id, { status })
      toast({ title: 'Status updated' })
      fetchRequests()
      setSelected(null)
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' })
    }
  }

  const handleMarkRead = async (id: string, isRead: boolean) => {
    try {
      await patchRequest(id, { isRead: !isRead })
      fetchRequests()
    } catch {
      toast({ title: 'Error', description: 'Failed to update request', variant: 'destructive' })
    }
  }

  const handleSaveNotes = async () => {
    if (!selected) return
    setSavingNotes(true)
    try {
      await patchRequest(selected.id, { adminNotes: notes })
      toast({ title: 'Notes saved' })
      fetchRequests()
    } catch {
      toast({ title: 'Error', description: 'Failed to save notes', variant: 'destructive' })
    } finally {
      setSavingNotes(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teach request?')) return
    try {
      const res = await fetch(`/api/teach-requests/${id}`, {
        method: 'DELETE',
        headers: csrfHeaders(),
      })
      if (res.ok) {
        toast({ title: 'Request deleted', description: 'The teach request has been removed.' })
        setSelected(null)
        fetchRequests()
      } else {
        toast({ title: 'Error', description: 'Failed to delete request', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
  }

  const filtered = requests.filter((r) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.expertise.toLowerCase().includes(q) ||
      (r.city || '').toLowerCase().includes(q)
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const newCount = requests.filter((r) => r.status === 'new').length

  const openDetail = (r: TeachRequest) => {
    setSelected(r)
    setNotes(r.adminNotes || '')
    if (!r.isRead) handleMarkRead(r.id, false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-upisha-navy dark:text-white flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-upisha-teal" />
          Teach Requests
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {requests.length} total · {newCount} new · Review applications and contact applicants manually
        </p>
      </div>

      {/* Search + status filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, expertise, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-upisha-teal" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <GraduationCap className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>{searchQuery || statusFilter !== 'all' ? 'No requests match your filters.' : 'No teach requests yet.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const meta = STATUS_META[r.status] ?? STATUS_META.new
            const StatusIcon = meta.icon
            return (
              <Card
                key={r.id}
                className={`dark:bg-gray-800 dark:border-gray-700 cursor-pointer transition-shadow hover:shadow-md ${
                  !r.isRead ? 'border-upisha-teal/30 bg-upisha-teal/5' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openDetail(r)}>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {!r.isRead && <span className="w-2 h-2 rounded-full bg-upisha-teal shrink-0" />}
                        <span className="font-semibold text-upisha-navy dark:text-white">{r.name}</span>
                        <Badge className={meta.cls}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {meta.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                        {r.expertise} · {r.format}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {r.email} · {r.city || 'City not provided'}
                        {r.createdAt ? ` · ${new Date(r.createdAt).toLocaleDateString()}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`mailto:${r.email}`}
                        title="Email applicant"
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-upisha-teal"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                      <a
                        href={`tel:${r.phone}`}
                        title="Call applicant"
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-upisha-teal"
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(r.id)}
                        className="text-gray-400 hover:text-red-500"
                        aria-label={`Delete request from ${r.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )
      }

      {/* Detail / review dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-upisha-navy dark:text-white">
                  <GraduationCap className="h-5 w-5 text-upisha-teal" />
                  Teach Request — {selected.name}
                </DialogTitle>
                <DialogDescription>
                  Review the application below, then contact the applicant directly by email or phone.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Contact row */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm min-w-0">
                    <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                    <a href={`mailto:${selected.email}`} className="text-upisha-teal hover:underline truncate">
                      {selected.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                    <a href={`tel:${selected.phone}`} className="text-upisha-teal hover:underline">
                      {selected.phone}
                    </a>
                  </div>
                </div>

                {/* Application details */}
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase">Qualification</p>
                    <p className="text-gray-700 dark:text-gray-300">{selected.qualification}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase">City</p>
                    <p className="text-gray-700 dark:text-gray-300">{selected.city || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase">Expertise</p>
                    <p className="text-gray-700 dark:text-gray-300">{selected.expertise}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase">Format</p>
                    <p className="text-gray-700 dark:text-gray-300 capitalize">{selected.format}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase">What they want to teach</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                    {selected.topic}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase">Experience</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                    {selected.experience}
                  </p>
                </div>
                {selected.links && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase">Links</p>
                    <a
                      href={selected.links.startsWith('http') ? selected.links : `https://${selected.links}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-upisha-teal hover:underline break-all inline-flex items-center gap-1"
                    >
                      {selected.links}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {selected.message && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase">Additional message</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                      {selected.message}
                    </p>
                  </div>
                )}

                {/* Status change */}
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase mb-1.5">Status</p>
                  <Select value={selected.status} onValueChange={(v) => handleStatusChange(selected.id, v)}>
                    <SelectTrigger className="w-full sm:w-56">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Admin notes */}
                <div>
                  <label htmlFor="teach-admin-notes" className="text-xs font-medium text-gray-400 uppercase block mb-1.5">
                    <MessageSquare className="h-3 w-3 inline mr-1" />
                    Admin notes (internal)
                  </label>
                  <Textarea
                    id="teach-admin-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Internal notes about this application..."
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveNotes}
                    disabled={savingNotes || notes === (selected.adminNotes || '')}
                    className="mt-2 bg-upisha-teal hover:bg-upisha-teal-dark text-white"
                  >
                    {savingNotes ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : null}
                    Save Notes
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
