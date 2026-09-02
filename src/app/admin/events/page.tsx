'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Plus, Pencil, Trash2, MapPin, X, Loader2, Search, Timer
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { csrfHeaders } from '@/lib/csrf'
import { eventSchema } from '@/lib/validations'
import { sanitizeFormData } from '@/lib/sanitize'

interface EventItem {
  id: string
  title: string
  date: string
  location: string
  description?: string | null
  isActive?: boolean
  countdownEnabled?: boolean
  countdownDate?: string | null
  badgeLabel?: string | null
  registrationLink?: string | null
  registrationLabel?: string | null
  createdAt?: Date
}

export default function AdminEventsPage() {
  const { toast } = useToast()
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<EventItem | null>(null)
  const [form, setForm] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    isActive: true,
    countdownEnabled: false,
    countdownDate: '',
    badgeLabel: '',
    registrationLink: '',
    registrationLabel: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events')
      if (res.ok) {
        const data = await res.json()
        setEvents(data.events || [])
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load events', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Client-side validation using Zod schema
    try {
      const sanitizedData = sanitizeFormData(form)
      eventSchema.parse({
        title: sanitizedData.title,
        date: sanitizedData.date,
        location: sanitizedData.location,
        description: sanitizedData.description,
        isActive: sanitizedData.isActive,
        countdownEnabled: sanitizedData.countdownEnabled,
        countdownDate: sanitizedData.countdownDate,
        badgeLabel: sanitizedData.badgeLabel,
        registrationLink: sanitizedData.registrationLink,
        registrationLabel: sanitizedData.registrationLabel,
      })
    } catch (err) {
      if (err instanceof Error && err.name === 'ZodError') {
        toast({ title: 'Validation error', description: 'Please check the form fields', variant: 'destructive' })
        return
      }
    }

    setSubmitting(true)
    try {
      const url = editing ? `/api/events/${editing.id}` : '/api/events'
      const method = editing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: csrfHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(form),
      })

      if (res.ok) {
        toast({
          title: editing ? 'Event updated' : 'Event created',
          description: editing ? 'The event has been updated successfully.' : 'A new event has been created.',
        })
        setShowForm(false)
        setEditing(null)
        setForm({ title: '', date: '', location: '', description: '', isActive: true, countdownEnabled: false, countdownDate: '', badgeLabel: '', registrationLink: '', registrationLabel: '' })
        fetchEvents()
      } else {
        const err = await res.json().catch(() => ({}))
        toast({ title: 'Error', description: err.error || 'Operation failed', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error. Please try again.', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (event: EventItem) => {
    setEditing(event)
    setForm({
      title: event.title,
      date: event.date,
      location: event.location,
      description: event.description || '',
      isActive: event.isActive ?? true,
      countdownEnabled: event.countdownEnabled ?? false,
      countdownDate: event.countdownDate || '',
      badgeLabel: event.badgeLabel || '',
      registrationLink: event.registrationLink || '',
      registrationLabel: event.registrationLabel || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE', headers: csrfHeaders() })
      if (res.ok) {
        toast({ title: 'Event deleted', description: 'The event has been removed.' })
        fetchEvents()
      } else {
        toast({ title: 'Error', description: 'Failed to delete event', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
  }

  const filteredEvents = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return events.filter((e) =>
      e.title.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q) ||
      e.date.toLowerCase().includes(q)
    )
  }, [events, searchQuery])

  const activeCount = events.filter((e) => e.isActive !== false).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-upisha-navy dark:text-white">Events</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage events and conferences</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Badge variant="secondary" className="text-xs">
            {activeCount} active
          </Badge>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setForm({ title: '', date: '', location: '', description: '', isActive: true, countdownEnabled: false, countdownDate: '', badgeLabel: '', registrationLink: '', registrationLabel: '' })
            setShowForm(!showForm)
          }}
          className="bg-upisha-teal hover:bg-upisha-teal-dark text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? 'Cancel' : 'Add New Event'}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-upisha-navy dark:text-white">
                  {editing ? 'Edit Event' : 'Create New Event'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                        Title *
                      </label>
                      <Input
                        required
                        placeholder="Event title"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                        Date *
                      </label>
                      <DatePicker
                        value={form.date}
                        onChange={(value) => setForm({ ...form, date: value })}
                        placeholder="Select event date"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Location *
                    </label>
                    <Input
                      required
                      placeholder="Event location"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Description
                    </label>
                    <Textarea
                      placeholder="Event description (optional)"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Show this event on the website</p>
                    </div>
                    <Switch
                      checked={form.isActive}
                      onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                    />
                  </div>
                  <div className="rounded-lg border border-upisha-teal/20 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium text-upisha-navy dark:text-white">Countdown Timer</label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Show a live countdown banner for this event on the homepage</p>
                      </div>
                      <Switch
                        checked={form.countdownEnabled}
                        onCheckedChange={(checked) => setForm({ ...form, countdownEnabled: checked })}
                      />
                    </div>
                    {form.countdownEnabled && (
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                            Countdown Date/Time *
                          </label>
                          <DatePicker
                            value={form.countdownDate}
                            onChange={(value) => setForm({ ...form, countdownDate: value })}
                            placeholder="Select countdown date & time"
                            withTime
                            required={form.countdownEnabled}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                            Badge Label
                          </label>
                          <Input
                            placeholder="e.g. Save the Date"
                            value={form.badgeLabel}
                            onChange={(e) => setForm({ ...form, badgeLabel: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                            Registration Link
                          </label>
                          <Input
                            placeholder="e.g. #join or https://..."
                            value={form.registrationLink}
                            onChange={(e) => setForm({ ...form, registrationLink: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                            Registration Button Label
                          </label>
                          <Input
                            placeholder="e.g. Register Now"
                            value={form.registrationLabel}
                            onChange={(e) => setForm({ ...form, registrationLabel: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      className="bg-upisha-teal hover:bg-upisha-teal-dark text-white"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        editing ? 'Update Event' : 'Create Event'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false)
                        setEditing(null)
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

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-upisha-teal" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>{searchQuery ? 'No events match your search.' : 'No events created yet.'}</p>
          <p className="text-sm">Click "Add New Event" to create one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-upisha-navy dark:text-white truncate">
                        {event.title}
                      </h3>
                      <Badge variant={event.isActive !== false ? 'default' : 'secondary'} className="shrink-0 text-xs">
                        {event.isActive !== false ? 'Active' : 'Inactive'}
                      </Badge>
                      {event.countdownEnabled && (
                        <Badge className="shrink-0 text-xs bg-upisha-gold text-white border-0">
                          <Timer className="h-3 w-3 mr-1" /> Countdown
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {event.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {event.location}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {event.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                      <Switch
                        checked={event.isActive !== false}
                        onCheckedChange={async (checked) => {
                          try {
                            const res = await fetch(`/api/events/${event.id}`, {
                              method: 'PUT',
                              headers: csrfHeaders({ 'Content-Type': 'application/json' }),
                              body: JSON.stringify({ isActive: checked }),
                            })
                            if (res.ok) {
                              toast({ title: checked ? 'Event activated' : 'Event deactivated' })
                              setEvents((prev) => prev.map((e) => e.id === event.id ? { ...e, isActive: checked } : e))
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
                        onClick={() => handleEdit(event)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(event.id)}
                        className="h-8 w-8 p-0 text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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