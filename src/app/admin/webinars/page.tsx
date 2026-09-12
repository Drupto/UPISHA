'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Monitor, Plus, Pencil, Trash2, X, Users, Search, Calendar, Clock, User,
  CheckCircle2, Loader2, Download, Eye, XCircle, Clock3, Award
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

interface WebinarItem {
  id: string
  title: string
  date: string
  time: string
  speaker: string
  duration: string
  description?: string | null
  registrationLink?: string | null
  meetingLink?: string | null
  type?: 'paid' | 'free'
  price?: number | null
  isActive?: boolean
  maxAttendees?: number | null
  registrationCount?: number
  createdAt?: Date
}

interface RegistrationItem {
  id: string
  fullName: string
  email: string
  phone: string
  qualification?: string | null
  city: string
  webinarId: string
  webinarTitle: string
  webinarType?: 'paid' | 'free'
  transactionNumber?: string | null
  registrationNumber?: string | null
  message?: string | null
  declaration: boolean
  status?: 'pending' | 'confirmed' | 'rejected'
  createdAt?: Date
}

type Tab = 'webinars' | 'registrations'
type StatusFilter = 'all' | 'pending' | 'confirmed' | 'rejected'

const statusStyles: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  confirmed: { label: 'Confirmed', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
}

export default function AdminWebinarsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<Tab>('webinars')

  // Webinars state
  const [webinars, setWebinars] = useState<WebinarItem[]>([])
  const [webinarsLoading, setWebinarsLoading] = useState(true)
  const [showWebinarForm, setShowWebinarForm] = useState(false)
  const [editingWebinar, setEditingWebinar] = useState<WebinarItem | null>(null)
  const [webinarForm, setWebinarForm] = useState({
    title: '',
    date: '',
    time: '',
    speaker: '',
    duration: '',
    description: '',
    registrationLink: '',
    meetingLink: '',
    type: 'paid' as 'paid' | 'free',
    price: '',
    maxAttendees: '',
  })
  const [webinarSubmitting, setWebinarSubmitting] = useState(false)

  // Registrations state
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([])
  const [registrationsLoading, setRegistrationsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationItem | null>(null)

  // Receipt status for the selected (paid) registration
  const [receiptInfo, setReceiptInfo] = useState<{ exists: boolean; receiptNumber?: string; amount?: number; issuedAt?: string | null } | null>(null)
  const [receiptLoading, setReceiptLoading] = useState(false)
  const [receiptGenerating, setReceiptGenerating] = useState(false)

  useEffect(() => {
    if (!selectedRegistration || selectedRegistration.webinarType !== 'paid') {
      setReceiptInfo(null)
      return
    }
    let cancelled = false
    setReceiptLoading(true)
    fetch(`/api/webinars/register/${selectedRegistration.id}/receipt`)
      .then((res) => res.json())
      .then((data) => { if (!cancelled) setReceiptInfo(data) })
      .catch(() => { if (!cancelled) setReceiptInfo(null) })
      .finally(() => { if (!cancelled) setReceiptLoading(false) })
    return () => { cancelled = true }
  }, [selectedRegistration])

  const handleGenerateReceipt = async () => {
    if (!selectedRegistration) return
    setReceiptGenerating(true)
    try {
      const res = await fetch(`/api/webinars/register/${selectedRegistration.id}/receipt`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        toast({
          title: 'Success',
          description: data.created ? 'Payment receipt generated.' : 'Receipt already exists.',
        })
        setReceiptInfo({
          exists: true,
          receiptNumber: data.receiptNumber,
          amount: data.amount,
          issuedAt: data.issuedAt,
        })
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to generate receipt', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error. Please try again.', variant: 'destructive' })
    } finally {
      setReceiptGenerating(false)
    }
  }


  // Certificate issuance state
  interface TemplateItem {
    id: string
    name: string
    accountType: string
    category?: string
    isActive?: boolean
  }
  const [certIssueOpen, setCertIssueOpen] = useState(false)
  const [certTargetRegistration, setCertTargetRegistration] = useState<RegistrationItem | null>(null)
  const [certTemplates, setCertTemplates] = useState<TemplateItem[]>([])
  const [certTemplatesLoading, setCertTemplatesLoading] = useState(false)
  const [certSelectedTemplate, setCertSelectedTemplate] = useState('')
  const [certIssuing, setCertIssuing] = useState(false)

  const fetchWebinars = async () => {
    try {
      const res = await fetch('/api/webinars')
      if (res.ok) {
        const data = await res.json()
        setWebinars(data.webinars || [])
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load webinars', variant: 'destructive' })
    } finally {
      setWebinarsLoading(false)
    }
  }

  const fetchRegistrations = async () => {
    setRegistrationsLoading(true)
    try {
      const res = await fetch('/api/webinars/register')
      if (res.ok) {
        const data = await res.json()
        setRegistrations(data.registrations || [])
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load registrations', variant: 'destructive' })
    } finally {
      setRegistrationsLoading(false)
    }
  }

  useEffect(() => {
    fetchWebinars()
  }, [])

  useEffect(() => {
    if (activeTab === 'registrations') {
      fetchRegistrations()
    }
  }, [activeTab])

  const handleWebinarSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!webinarForm.title || !webinarForm.date || !webinarForm.time || !webinarForm.speaker || !webinarForm.duration) {
      toast({ title: 'Validation error', description: 'Please fill all required fields', variant: 'destructive' })
      return
    }
    if (webinarForm.type === 'paid' && (!webinarForm.price || Number(webinarForm.price) <= 0)) {
      toast({ title: 'Validation error', description: 'Please enter a fee amount (₹) for paid webinars', variant: 'destructive' })
      return
    }
    setWebinarSubmitting(true)
    try {
      const url = editingWebinar
        ? `/api/webinars/${editingWebinar.id}`
        : '/api/webinars'
      const method = editingWebinar ? 'PUT' : 'POST'

      const payload = {
        ...webinarForm,
        maxAttendees: webinarForm.maxAttendees ? Number(webinarForm.maxAttendees) : null,
        price: webinarForm.type === 'paid' && webinarForm.price ? Number(webinarForm.price) : null,
        registrationLink: webinarForm.registrationLink || null,
        meetingLink: webinarForm.meetingLink || null,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast({
          title: editingWebinar ? 'Webinar updated' : 'Webinar created',
          description: editingWebinar ? 'The webinar has been updated successfully.' : 'A new webinar has been created.',
        })
        setShowWebinarForm(false)
        setEditingWebinar(null)
        setWebinarForm({ title: '', date: '', time: '', speaker: '', duration: '', description: '', registrationLink: '', meetingLink: '', type: 'paid', price: '', maxAttendees: '' })
        fetchWebinars()
      } else {
        const err = await res.json().catch(() => ({}))
        toast({ title: 'Error', description: err.error || 'Operation failed', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error. Please try again.', variant: 'destructive' })
    } finally {
      setWebinarSubmitting(false)
    }
  }

  const handleEditWebinar = (webinar: WebinarItem) => {
    setEditingWebinar(webinar)
    setWebinarForm({
      title: webinar.title,
      date: webinar.date,
      time: webinar.time,
      speaker: webinar.speaker,
      duration: webinar.duration,
      description: webinar.description || '',
      registrationLink: webinar.registrationLink || '',
      meetingLink: webinar.meetingLink || '',
      type: webinar.type || 'paid',
      price: webinar.price != null ? String(webinar.price) : '',
      maxAttendees: webinar.maxAttendees ? String(webinar.maxAttendees) : '',
    })
    setShowWebinarForm(true)
  }

  const handleDeleteWebinar = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webinar?')) return
    try {
      const res = await fetch(`/api/webinars/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Webinar deleted', description: 'The webinar has been removed.' })
        fetchWebinars()
      } else {
        toast({ title: 'Error', description: 'Failed to delete webinar', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
  }

  const handleDeleteRegistration = async (id: string) => {
    if (!confirm('Are you sure you want to delete this registration?')) return
    try {
      const res = await fetch(`/api/webinars/register/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Registration deleted', description: 'The registration has been removed.' })
        fetchRegistrations()
        setSelectedRegistration(null)
      } else {
        toast({ title: 'Error', description: 'Failed to delete registration', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
  }

  const handleStatusChange = async (id: string, status: 'pending' | 'confirmed' | 'rejected') => {
    try {
      const res = await fetch(`/api/webinars/register/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast({ title: `Registration ${status}`, description: `Registration marked as ${status}.` })
        setRegistrations((prev) => prev.map((r) => r.id === id ? { ...r, status } : r))
        setSelectedRegistration((prev) => prev && prev.id === id ? { ...prev, status } : prev)
      } else {
        toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
  }

  const openIssueCertificate = async (reg: RegistrationItem) => {
    setCertTargetRegistration(reg)
    setCertSelectedTemplate('')
    setCertIssueOpen(true)
    setCertTemplatesLoading(true)
    try {
      const res = await fetch('/api/certificates/templates')
      if (res.ok) {
        const data = await res.json()
        // Only show webinar templates
        setCertTemplates((data.templates || []).filter((t: TemplateItem) => t.isActive !== false && (t.category || 'membership') === 'webinar'))
      } else {
        toast({ title: 'Error', description: 'Failed to load certificate templates', variant: 'destructive' })
        setCertIssueOpen(false)
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load certificate templates', variant: 'destructive' })
      setCertIssueOpen(false)
    } finally {
      setCertTemplatesLoading(false)
    }
  }

  const handleIssueCertificate = async () => {
    if (!certTargetRegistration || !certSelectedTemplate) {
      toast({ title: 'Error', description: 'Please select a certificate template', variant: 'destructive' })
      return
    }
    setCertIssuing(true)
    try {
      const res = await fetch('/api/certificates/webinar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: certTargetRegistration.id,
          templateId: certSelectedTemplate,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to issue certificate')
      }
      toast({ title: 'Success', description: 'Webinar certificate issued. An email notification has been sent.' })
      setCertIssueOpen(false)
      setCertTargetRegistration(null)
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to issue certificate', variant: 'destructive' })
    } finally {
      setCertIssuing(false)
    }
  }

  const exportRegistrationsCSV = () => {
    const rows = [
      ['Name', 'Email', 'Phone', 'Qualification', 'City', 'Webinar', 'Reg No', 'Transaction No', 'Status', 'Date'],
      ...filteredRegistrations.map((r) => {
        const dateVal = r.createdAt && !isNaN(new Date(r.createdAt as any).getTime()) ? new Date(r.createdAt as any).toLocaleDateString() : ''
        return [
          r.fullName,
          r.email,
          r.phone,
          r.qualification || '',
          r.city,
          r.webinarTitle,
          r.registrationNumber || '',
          r.transactionNumber || '',
          r.status || 'pending',
          dateVal,
        ]
      }),
    ]
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'webinar-registrations.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const getRegistrationsCount = (webinarId: string) =>
    registrations.filter((r) => r.webinarId === webinarId).length

  const filteredRegistrations = (() => {
    const q = searchQuery.toLowerCase()
    return registrations.filter((r) => {
      const matchesSearch = (
        r.fullName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.webinarTitle.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q)
      )
      const matchesStatus = statusFilter === 'all' || (r.status || 'pending') === statusFilter
      return matchesSearch && matchesStatus
    })
  })()

  const statusCounts = (() => ({
    all: registrations.length,
    pending: registrations.filter((r) => (r.status || 'pending') === 'pending').length,
    confirmed: registrations.filter((r) => r.status === 'confirmed').length,
    rejected: registrations.filter((r) => r.status === 'rejected').length,
  }))()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-upisha-navy dark:text-white">Webinars</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage webinars and view registrations</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('webinars')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'webinars'
              ? 'bg-white dark:bg-gray-700 text-upisha-teal shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Monitor className="h-4 w-4" />
          Manage Webinars
        </button>
        <button
          onClick={() => setActiveTab('registrations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'registrations'
              ? 'bg-white dark:bg-gray-700 text-upisha-teal shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" />
          View Registrations
          {registrations.length > 0 && (
            <span className="text-xs bg-upisha-teal/10 text-upisha-teal px-1.5 py-0.5 rounded-full">
              {registrations.length}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'webinars' ? (
          <motion.div
            key="webinars"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="mb-4">
              <Button
                onClick={() => {
                  setEditingWebinar(null)
                  setWebinarForm({ title: '', date: '', time: '', speaker: '', duration: '', description: '', registrationLink: '', meetingLink: '', type: 'paid', price: '', maxAttendees: '' })
                  setShowWebinarForm(!showWebinarForm)
                }}
                className="bg-upisha-teal hover:bg-upisha-teal-dark text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                {showWebinarForm ? 'Cancel' : 'Add New Webinar'}
              </Button>
            </div>

            {/* Webinar Form */}
            <AnimatePresence>
              {showWebinarForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-6"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-upisha-navy dark:text-white">
                        {editingWebinar ? 'Edit Webinar' : 'Create New Webinar'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleWebinarSubmit} className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                              Title *
                            </label>
                            <Input
                              required
                              placeholder="Webinar title"
                              value={webinarForm.title}
                              onChange={(e) => setWebinarForm({ ...webinarForm, title: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                              Speaker *
                            </label>
                            <Input
                              required
                              placeholder="Speaker name"
                              value={webinarForm.speaker}
                              onChange={(e) => setWebinarForm({ ...webinarForm, speaker: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                              Date *
                            </label>
                            <DatePicker
                              value={webinarForm.date}
                              onChange={(value) => setWebinarForm({ ...webinarForm, date: value })}
                              placeholder="Select webinar date"
                              isoValue
                              required
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                              Time *
                            </label>
                            <Input
                              required
                              placeholder="e.g. 4:00 PM IST"
                              value={webinarForm.time}
                              onChange={(e) => setWebinarForm({ ...webinarForm, time: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                              Duration *
                            </label>
                            <Input
                              required
                              placeholder="e.g. 60 min"
                              value={webinarForm.duration}
                              onChange={(e) => setWebinarForm({ ...webinarForm, duration: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                              Webinar Type *
                            </label>
                            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                              {(['paid', 'free'] as const).map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setWebinarForm({ ...webinarForm, type: t })}
                                  className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                                    webinarForm.type === t
                                      ? 'bg-white dark:bg-gray-700 text-upisha-teal shadow-sm'
                                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                  }`}
                                >
                                  {t === 'free' ? 'Free' : 'Paid'}
                                </button>
                              ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              {webinarForm.type === 'free'
                                ? 'Free webinars are auto-confirmed on registration. No payment required.'
                                : 'Paid webinars require a transaction number and admin confirmation.'}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                              Max Attendees
                            </label>
                            <Input
                              type="number"
                              min="1"
                              placeholder="e.g. 100 (optional)"
                              value={webinarForm.maxAttendees}
                              onChange={(e) => setWebinarForm({ ...webinarForm, maxAttendees: e.target.value })}
                            />
                            <p className="text-xs text-gray-400 mt-1">Leave empty for unlimited seats</p>
                          </div>
                        </div>
                        {webinarForm.type === 'paid' && (
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                              Fee Amount (₹) *
                            </label>
                            <Input
                              type="number"
                              min="1"
                              required
                              placeholder="e.g. 500"
                              value={webinarForm.price}
                              onChange={(e) => setWebinarForm({ ...webinarForm, price: e.target.value })}
                            />
                            <p className="text-xs text-gray-400 mt-1">
                              Amount attendees must pay. Shown on the website and printed on the payment receipt.
                            </p>
                          </div>
                        )}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                              Registration Link
                            </label>
                            <Input
                              placeholder="https://..."
                              value={webinarForm.registrationLink}
                              onChange={(e) => setWebinarForm({ ...webinarForm, registrationLink: e.target.value })}
                            />
                            <p className="text-xs text-gray-400 mt-1">External registration link (optional)</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                              Meeting / Join Link
                            </label>
                            <Input
                              placeholder="https://meet.google.com/..."
                              value={webinarForm.meetingLink}
                              onChange={(e) => setWebinarForm({ ...webinarForm, meetingLink: e.target.value })}
                            />
                            <p className="text-xs text-gray-400 mt-1">Live meeting link for attendees (e.g. for free webinars)</p>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                            Description
                          </label>
                          <Textarea
                            placeholder="Webinar description (optional)"
                            value={webinarForm.description}
                            onChange={(e) => setWebinarForm({ ...webinarForm, description: e.target.value })}
                            rows={3}
                          />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Show this webinar on the website</p>
                          </div>
                          <Switch
                            checked={editingWebinar?.isActive ?? true}
                            onCheckedChange={(checked) => setEditingWebinar((prev) => prev ? { ...prev, isActive: checked } : { ...webinarForm, title: '', date: '', time: '', speaker: '', duration: '', description: '', registrationLink: '', maxAttendees: '', isActive: checked } as any)}
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button
                            type="submit"
                            className="bg-upisha-teal hover:bg-upisha-teal-dark text-white"
                            disabled={webinarSubmitting}
                          >
                            {webinarSubmitting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Saving...
                              </>
                            ) : (
                              editingWebinar ? 'Update Webinar' : 'Create Webinar'
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowWebinarForm(false)
                              setEditingWebinar(null)
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Webinars List */}
            {webinarsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-upisha-teal" />
              </div>
            ) : webinars.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Monitor className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No webinars created yet.</p>
                <p className="text-sm">Click "Add New Webinar" to create one.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {webinars.map((webinar) => {
                  const count = webinar.registrationCount ?? getRegistrationsCount(webinar.id)
                  const isFull = webinar.maxAttendees ? count >= webinar.maxAttendees : false
                  return (
                    <Card key={webinar.id} className="dark:bg-gray-800 dark:border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-upisha-navy dark:text-white truncate">
                                {webinar.title}
                              </h3>
                              <Badge variant="outline" className="shrink-0 text-xs">
                                {webinar.duration}
                              </Badge>
                              <Badge variant={webinar.isActive !== false ? 'default' : 'secondary'} className="shrink-0 text-xs">
                                {webinar.isActive !== false ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {webinar.date ? new Date(webinar.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date TBD'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {webinar.time}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" /> {webinar.speaker}
                              </span>
                              <span className={`flex items-center gap-1 ${isFull ? 'text-red-500' : ''}`}>
                                <Users className="h-3 w-3" /> {count} registered
                                {webinar.maxAttendees ? ` / ${webinar.maxAttendees}` : ''}
                              </span>
                            </div>
                            {webinar.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                                {webinar.description}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {webinar.isActive !== false ? 'Active' : 'Inactive'}
                              </span>
                              <Switch
                                checked={webinar.isActive !== false}
                                onCheckedChange={async (checked) => {
                                  try {
                                    const res = await fetch(`/api/webinars/${webinar.id}`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ isActive: checked }),
                                    })
                                    if (res.ok) {
                                      toast({ title: checked ? 'Webinar activated' : 'Webinar deactivated' })
                                      setWebinars((prev) => prev.map((w) => w.id === webinar.id ? { ...w, isActive: checked } : w))
                                    } else {
                                      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' })
                                    }
                                  } catch {
                                    toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
                                  }
                                }}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditWebinar(webinar)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteWebinar(webinar.id)}
                                className="h-8 w-8 p-0 text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="registrations"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Search + Status Filter + Export */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="relative max-w-sm flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, webinar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  {(['all', 'pending', 'confirmed', 'rejected'] as StatusFilter[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                        statusFilter === s
                          ? 'bg-white dark:bg-gray-700 text-upisha-teal shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {s} ({statusCounts[s]})
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={exportRegistrationsCSV}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>

            {/* Registrations Table */}
            {registrationsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-upisha-teal" />
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>{searchQuery || statusFilter !== 'all' ? 'No registrations match your filters.' : 'No registrations yet.'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-3 px-3 font-medium text-gray-500 dark:text-gray-400">Name</th>
                      <th className="text-left py-3 px-3 font-medium text-gray-500 dark:text-gray-400">Email</th>
                      <th className="text-left py-3 px-3 font-medium text-gray-500 dark:text-gray-400">Phone</th>
                      <th className="text-left py-3 px-3 font-medium text-gray-500 dark:text-gray-400">City</th>
                      <th className="text-left py-3 px-3 font-medium text-gray-500 dark:text-gray-400">Webinar</th>
                      <th className="text-left py-3 px-3 font-medium text-gray-500 dark:text-gray-400">Reg No.</th>
                      <th className="text-left py-3 px-3 font-medium text-gray-500 dark:text-gray-400">Txn No.</th>
                      <th className="text-left py-3 px-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-3 font-medium text-gray-500 dark:text-gray-400">Date</th>
                      <th className="text-left py-3 px-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrations.map((reg) => {
                      const st = statusStyles[reg.status || 'pending']
                      return (
                        <tr key={reg.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="py-3 px-3 font-medium text-upisha-navy dark:text-white">{reg.fullName}</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-300">{reg.email}</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-300">{reg.phone}</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-300">{reg.city}</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-300 max-w-[200px] truncate" title={reg.webinarTitle}>
                            {reg.webinarTitle}
                          </td>
                          <td className="py-3 px-3 text-upisha-teal dark:text-teal-300 text-xs font-mono font-semibold">
                            {reg.registrationNumber || '-'}
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-300 text-xs font-mono">
                            {reg.transactionNumber || '-'}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${st.className}`}>
                              {st.label}
                            </span>
                          </td>
                           <td className="py-3 px-3 text-gray-500 dark:text-gray-400 text-xs">
                             {reg.createdAt && !isNaN(new Date(reg.createdAt as any).getTime()) ? new Date(reg.createdAt as any).toLocaleDateString() : '-'}
                           </td>
                          <td className="py-3 px-3">
                            <div className="flex gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedRegistration(reg)}
                                className="h-8 w-8 p-0"
                                title="View details"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              {reg.status === 'confirmed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openIssueCertificate(reg)}
                                  className="h-8 w-8 p-0 text-upisha-teal border-upisha-teal/40 hover:bg-upisha-teal/10"
                                  title="Issue certificate"
                                >
                                  <Award className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteRegistration(reg.id)}
                                className="h-8 w-8 p-0 text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <p className="text-xs text-gray-400 mt-2">
                  Showing {filteredRegistrations.length} of {registrations.length} registrations
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Registration Detail Modal */}
      <AnimatePresence>
        {selectedRegistration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setSelectedRegistration(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b dark:border-gray-700">
                <h3 className="text-lg font-bold text-upisha-navy dark:text-white">Registration Details</h3>
                <button
                  onClick={() => setSelectedRegistration(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-upisha-navy dark:text-white">{selectedRegistration.fullName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedRegistration.email}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[selectedRegistration.status || 'pending'].className}`}>
                    {statusStyles[selectedRegistration.status || 'pending'].label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="text-gray-700 dark:text-gray-300">{selectedRegistration.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">City</p>
                    <p className="text-gray-700 dark:text-gray-300">{selectedRegistration.city}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Qualification</p>
                    <p className="text-gray-700 dark:text-gray-300">{selectedRegistration.qualification || '-'}</p>
                  </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Registered On</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {selectedRegistration.createdAt && !isNaN(new Date(selectedRegistration.createdAt as any).getTime()) ? new Date(selectedRegistration.createdAt as any).toLocaleString() : '-'}
                      </p>
                    </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1">Webinar</p>
                  <p className="text-sm font-medium text-upisha-navy dark:text-white">{selectedRegistration.webinarTitle}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1">Registration Number</p>
                  <p className="text-sm font-mono text-upisha-teal dark:text-teal-300 font-semibold">{selectedRegistration.registrationNumber || '-'}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1">Transaction Number</p>
                  <p className="text-sm font-mono text-gray-700 dark:text-gray-300">{selectedRegistration.transactionNumber || '-'}</p>
                </div>

                {selectedRegistration.webinarType === 'paid' && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Payment Receipt</p>
                    {receiptLoading ? (
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Checking…
                      </p>
                    ) : receiptInfo?.exists ? (
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-mono text-upisha-teal dark:text-teal-300 font-semibold">
                          {receiptInfo.receiptNumber}
                        </p>
                        <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-2 py-0.5 rounded-full">
                          Generated
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-gray-500">Not generated yet</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-upisha-teal text-upisha-teal hover:bg-upisha-teal/10"
                          onClick={handleGenerateReceipt}
                          disabled={receiptGenerating}
                        >
                          {receiptGenerating ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                              Generating…
                            </>
                          ) : (
                            'Generate Receipt'
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {selectedRegistration.message && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Message</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                      {selectedRegistration.message}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t dark:border-gray-700">
                  {selectedRegistration.status === 'confirmed' && (
                    <Button
                      size="sm"
                      className="bg-upisha-teal hover:bg-upisha-teal-dark text-white"
                      onClick={() => {
                        openIssueCertificate(selectedRegistration)
                        setSelectedRegistration(null)
                      }}
                    >
                      <Award className="h-3.5 w-3.5 mr-1.5" />
                      Issue Certificate
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleStatusChange(selectedRegistration.id, 'confirmed')}
                    disabled={selectedRegistration.status === 'confirmed'}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-300 text-amber-600 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/30"
                    onClick={() => handleStatusChange(selectedRegistration.id, 'pending')}
                    disabled={selectedRegistration.status === 'pending'}
                  >
                    <Clock3 className="h-3.5 w-3.5 mr-1.5" />
                    Pending
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
                    onClick={() => handleStatusChange(selectedRegistration.id, 'rejected')}
                    disabled={selectedRegistration.status === 'rejected'}
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1.5" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-auto text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30"
                    onClick={() => handleDeleteRegistration(selectedRegistration.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Issue Certificate Dialog */}
      <Dialog open={certIssueOpen} onOpenChange={setCertIssueOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Issue Webinar Certificate</DialogTitle>
            <DialogDescription>
              {certTargetRegistration
                ? `Issue a participation certificate for ${certTargetRegistration.fullName} (${certTargetRegistration.webinarTitle}). Confirm they attended before issuing.`
                : 'Select a registered attendee to issue a certificate.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Certificate Template</Label>
              {certTemplatesLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading templates...
                </div>
              ) : certTemplates.length === 0 ? (
                <div className="text-sm text-gray-500 border rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
                  No webinar certificate templates found. Create one in{' '}
                  <a href="/admin/certificates/templates" className="text-upisha-teal hover:underline">
                    Certificate Templates
                  </a>{' '}
                  first.
                </div>
              ) : (
                <Select value={certSelectedTemplate} onValueChange={setCertSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a webinar certificate template" />
                  </SelectTrigger>
                  <SelectContent>
                    {certTemplates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCertIssueOpen(false)} disabled={certIssuing}>
              Cancel
            </Button>
            <Button
              onClick={handleIssueCertificate}
              disabled={certIssuing || certTemplatesLoading || !certSelectedTemplate}
              className="bg-upisha-teal hover:bg-upisha-teal-dark text-white"
            >
              {certIssuing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Issuing...
                </>
              ) : (
                <>
                  <Award className="h-4 w-4 mr-2" />
                  Issue Certificate
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
