'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Monitor, Plus, Pencil, Trash2, X, Users, Search, Calendar, Clock, User,
  CheckCircle2, AlertCircle, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface WebinarItem {
  id: string
  title: string
  date: string
  time: string
  speaker: string
  duration: string
  description?: string | null
  isActive?: boolean
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
  transactionNumber?: string | null
  message?: string | null
  declaration: boolean
  createdAt?: Date
}

type Tab = 'webinars' | 'registrations'

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
  })
  const [webinarSubmitting, setWebinarSubmitting] = useState(false)

  // Registrations state
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([])
  const [registrationsLoading, setRegistrationsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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
    setWebinarSubmitting(true)
    try {
      const url = editingWebinar
        ? `/api/webinars/${editingWebinar.id}`
        : '/api/webinars'
      const method = editingWebinar ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webinarForm),
      })

      if (res.ok) {
        toast({
          title: editingWebinar ? 'Webinar updated' : 'Webinar created',
          description: editingWebinar ? 'The webinar has been updated successfully.' : 'A new webinar has been created.',
        })
        setShowWebinarForm(false)
        setEditingWebinar(null)
        setWebinarForm({ title: '', date: '', time: '', speaker: '', duration: '', description: '' })
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

  const filteredRegistrations = registrations.filter((r) => {
    const q = searchQuery.toLowerCase()
    return (
      r.fullName.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.webinarTitle.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q)
    )
  })

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
                  setWebinarForm({ title: '', date: '', time: '', speaker: '', duration: '', description: '' })
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
                            <Input
                              required
                              type="date"
                              value={webinarForm.date}
                              onChange={(e) => setWebinarForm({ ...webinarForm, date: e.target.value })}
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
                {webinars.map((webinar) => (
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
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {webinar.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {webinar.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" /> {webinar.speaker}
                            </span>
                          </div>
                          {webinar.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                              {webinar.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
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
                    </CardContent>
                  </Card>
                ))}
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
            {/* Search */}
            <div className="mb-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, webinar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
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
                <p>{searchQuery ? 'No registrations match your search.' : 'No registrations yet.'}</p>
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
                      <th className="text-left py-3 px-3 font-medium text-gray-500 dark:text-gray-400">Txn No.</th>
                      <th className="text-left py-3 px-3 font-medium text-gray-500 dark:text-gray-400">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrations.map((reg) => (
                      <tr key={reg.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 px-3 font-medium text-upisha-navy dark:text-white">{reg.fullName}</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-300">{reg.email}</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-300">{reg.phone}</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-300">{reg.city}</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-300 max-w-[200px] truncate" title={reg.webinarTitle}>
                          {reg.webinarTitle}
                        </td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-300 text-xs font-mono">
                          {reg.transactionNumber || '-'}
                        </td>
                        <td className="py-3 px-3 text-gray-500 dark:text-gray-400 text-xs">
                          {reg.createdAt ? new Date(reg.createdAt.toString()).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
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
    </div>
  )
}