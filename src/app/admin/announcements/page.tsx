'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Megaphone, Plus, Pencil, Trash2, Calendar, Tag, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface AnnouncementItem {
  id: string
  title: string
  date: string
  type: string
  content?: string | null
  isActive?: boolean
  createdAt?: Date
}

export default function AdminAnnouncementsPage() {
  const { toast } = useToast()
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<AnnouncementItem | null>(null)
  const [form, setForm] = useState({
    title: '',
    date: '',
    type: 'Announcement',
    content: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements')
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(data.announcements || [])
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load announcements', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.date || !form.type) {
      toast({ title: 'Validation error', description: 'Please fill all required fields', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      const url = editing ? `/api/announcements/${editing.id}` : '/api/announcements'
      const method = editing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        toast({
          title: editing ? 'Announcement updated' : 'Announcement created',
          description: editing ? 'The announcement has been updated successfully.' : 'A new announcement has been created.',
        })
        setShowForm(false)
        setEditing(null)
        setForm({ title: '', date: '', type: 'Announcement', content: '' })
        fetchAnnouncements()
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

  const handleEdit = (announcement: AnnouncementItem) => {
    setEditing(announcement)
    setForm({
      title: announcement.title,
      date: announcement.date,
      type: announcement.type,
      content: announcement.content || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Announcement deleted', description: 'The announcement has been removed.' })
        fetchAnnouncements()
      } else {
        toast({ title: 'Error', description: 'Failed to delete announcement', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-upisha-navy dark:text-white">Announcements</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage news and announcements</p>
        </div>
      </div>

      <div className="mb-4">
        <Button
          onClick={() => {
            setEditing(null)
            setForm({ title: '', date: '', type: 'Announcement', content: '' })
            setShowForm(!showForm)
          }}
          className="bg-upisha-teal hover:bg-upisha-teal-dark text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? 'Cancel' : 'Add New Announcement'}
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
                  {editing ? 'Edit Announcement' : 'Create New Announcement'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Title *
                    </label>
                    <Input
                      required
                      placeholder="Announcement title"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                        Date *
                      </label>
                      <Input
                        required
                        placeholder="e.g. 15 Mar 2026"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                        Type *
                      </label>
                      <Input
                        required
                        placeholder="e.g. Event, Workshop, Publication"
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Content
                    </label>
                    <Textarea
                      placeholder="Announcement content (optional)"
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                      rows={3}
                    />
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
                        editing ? 'Update Announcement' : 'Create Announcement'
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
      ) : announcements.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Megaphone className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No announcements created yet.</p>
          <p className="text-sm">Click "Add New Announcement" to create one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-upisha-navy dark:text-white truncate">
                        {announcement.title}
                      </h3>
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {announcement.type}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {announcement.date}
                      </span>
                    </div>
                    {announcement.content && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                        {announcement.content}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(announcement)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(announcement.id)}
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
    </div>
  )
}