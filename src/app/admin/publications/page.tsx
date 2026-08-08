'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Plus, Pencil, Trash2, X, Search, CheckCircle2, Loader2, Download, Eye, XCircle, Clock3, FileText, ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'

interface PublicationItem {
  id: string
  title: string
  description: string
  type: 'Journal' | 'Monograph' | 'Research'
  author?: string | null
  fileUrl?: string | null
  link?: string | null
  isActive?: boolean
  createdAt?: Date
}

interface SubmissionItem {
  id: string
  title: string
  description: string
  type: 'Journal' | 'Monograph' | 'Research'
  authorName: string
  authorEmail: string
  abstract?: string | null
  fileUrl?: string | null
  status: 'pending' | 'approved' | 'rejected'
  createdAt?: Date
}

type Tab = 'publications' | 'submissions'
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

const statusStyles: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  approved: { label: 'Approved', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
}

export default function AdminPublicationsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<Tab>('publications')

  // Publications state
  const [publications, setPublications] = useState<PublicationItem[]>([])
  const [publicationsLoading, setPublicationsLoading] = useState(true)
  const [showPublicationForm, setShowPublicationForm] = useState(false)
  const [editingPublication, setEditingPublication] = useState<PublicationItem | null>(null)
  const [publicationForm, setPublicationForm] = useState({
    title: '',
    description: '',
    type: 'Journal' as 'Journal' | 'Monograph' | 'Research',
    author: '',
    fileUrl: '',
    link: '',
  })
  const [publicationSubmitting, setPublicationSubmitting] = useState(false)

  // Submissions state
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([])
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionItem | null>(null)

  const fetchPublications = async () => {
    try {
      const res = await fetch('/api/publications')
      if (res.ok) {
        const data = await res.json()
        setPublications(data.publications || [])
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load publications', variant: 'destructive' })
    } finally {
      setPublicationsLoading(false)
    }
  }

  const fetchSubmissions = async () => {
    setSubmissionsLoading(true)
    try {
      const res = await fetch('/api/publications/submissions')
      if (res.ok) {
        const data = await res.json()
        setSubmissions(data.submissions || [])
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load submissions', variant: 'destructive' })
    } finally {
      setSubmissionsLoading(false)
    }
  }

  useEffect(() => {
    fetchPublications()
  }, [])

  useEffect(() => {
    if (activeTab === 'submissions') {
      fetchSubmissions()
    }
  }, [activeTab])

  const handlePublicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicationForm.title || !publicationForm.description) {
      toast({ title: 'Validation error', description: 'Please fill all required fields', variant: 'destructive' })
      return
    }
    setPublicationSubmitting(true)
    try {
      const url = '/api/publications'
      const method = editingPublication ? 'PUT' : 'POST'
      const payload = editingPublication
        ? { ...publicationForm, id: editingPublication.id, isActive: editingPublication.isActive ?? true }
        : { ...publicationForm, isActive: true }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast({
          title: editingPublication ? 'Publication updated' : 'Publication created',
          description: editingPublication ? 'The publication has been updated successfully.' : 'A new publication has been created.',
        })
        setShowPublicationForm(false)
        setEditingPublication(null)
        setPublicationForm({ title: '', description: '', type: 'Journal', author: '', fileUrl: '', link: '' })
        fetchPublications()
      } else {
        const err = await res.json().catch(() => ({}))
        toast({ title: 'Error', description: err.error || 'Operation failed', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error. Please try again.', variant: 'destructive' })
    } finally {
      setPublicationSubmitting(false)
    }
  }

  const handleEditPublication = (pub: PublicationItem) => {
    setEditingPublication(pub)
    setPublicationForm({
      title: pub.title,
      description: pub.description,
      type: pub.type,
      author: pub.author || '',
      fileUrl: pub.fileUrl || '',
      link: pub.link || '',
    })
    setShowPublicationForm(true)
  }

  const handleDeletePublication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this publication?')) return
    try {
      const res = await fetch('/api/publications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        toast({ title: 'Publication deleted', description: 'The publication has been removed.' })
        fetchPublications()
      } else {
        toast({ title: 'Error', description: 'Failed to delete publication', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
  }

  const handleStatusChange = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/publications/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast({ title: `Submission ${status}`, description: `Submission marked as ${status}.` })
        setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, status } : s))
        setSelectedSubmission((prev) => prev && prev.id === id ? { ...prev, status } : prev)
        if (status === 'approved') {
          fetchPublications()
        }
      } else {
        toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
  }

  const handleDeleteSubmission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return
    try {
      const res = await fetch(`/api/publications/submissions/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Submission deleted', description: 'The submission has been removed.' })
        fetchSubmissions()
        setSelectedSubmission(null)
      } else {
        toast({ title: 'Error', description: 'Failed to delete submission', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
  }

  const filteredSubmissions = (() => {
    const q = searchQuery.toLowerCase()
    return submissions.filter((s) => {
      const matchesSearch = (
        s.title.toLowerCase().includes(q) ||
        s.authorName.toLowerCase().includes(q) ||
        s.authorEmail.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q)
      )
      const matchesStatus = statusFilter === 'all' || (s.status || 'pending') === statusFilter
      return matchesSearch && matchesStatus
    })
  })()

  const statusCounts = (() => ({
    all: submissions.length,
    pending: submissions.filter((s) => (s.status || 'pending') === 'pending').length,
    approved: submissions.filter((s) => s.status === 'approved').length,
    rejected: submissions.filter((s) => s.status === 'rejected').length,
  }))()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-upisha-navy dark:text-white">Publications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage publications and review submissions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('publications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'publications'
              ? 'bg-white dark:bg-gray-700 text-upisha-teal shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Manage Publications
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'submissions'
              ? 'bg-white dark:bg-gray-700 text-upisha-teal shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <FileText className="h-4 w-4" />
          Review Submissions
          {submissions.length > 0 && (
            <span className="text-xs bg-upisha-teal/10 text-upisha-teal px-1.5 py-0.5 rounded-full">
              {submissions.length}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'publications' ? (
          <motion.div
            key="publications"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="mb-4">
              <Button
                onClick={() => {
                  setEditingPublication(null)
                  setPublicationForm({ title: '', description: '', type: 'Journal', author: '', fileUrl: '', link: '' })
                  setShowPublicationForm(!showPublicationForm)
                }}
                className="bg-upisha-teal hover:bg-upisha-teal-dark text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                {showPublicationForm ? 'Cancel' : 'Add New Publication'}
              </Button>
            </div>

            {/* Publication Form */}
            <AnimatePresence>
              {showPublicationForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-6"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-upisha-navy dark:text-white">
                        {editingPublication ? 'Edit Publication' : 'Create New Publication'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handlePublicationSubmit} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                            Title *
                          </label>
                          <Input
                            required
                            placeholder="Publication title"
                            value={publicationForm.title}
                            onChange={(e) => setPublicationForm({ ...publicationForm, title: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                            Description *
                          </label>
                          <Textarea
                            required
                            placeholder="Publication description"
                            value={publicationForm.description}
                            onChange={(e) => setPublicationForm({ ...publicationForm, description: e.target.value })}
                            rows={3}
                          />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                              Type *
                            </label>
                            <select
                              value={publicationForm.type}
                              onChange={(e) => setPublicationForm({ ...publicationForm, type: e.target.value as 'Journal' | 'Monograph' | 'Research' })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-upisha-teal dark:bg-gray-800 dark:border-gray-700"
                            >
                              <option value="Journal">Journal</option>
                              <option value="Monograph">Monograph</option>
                              <option value="Research">Research</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                              Author
                            </label>
                            <Input
                              placeholder="Author name (optional)"
                              value={publicationForm.author}
                              onChange={(e) => setPublicationForm({ ...publicationForm, author: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                              File URL (PDF)
                            </label>
                            <Input
                              placeholder="https://... (optional)"
                              value={publicationForm.fileUrl}
                              onChange={(e) => setPublicationForm({ ...publicationForm, fileUrl: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                              External Link
                            </label>
                            <Input
                              placeholder="https://... (optional)"
                              value={publicationForm.link}
                              onChange={(e) => setPublicationForm({ ...publicationForm, link: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            type="submit"
                            className="bg-upisha-teal hover:bg-upisha-teal-dark text-white"
                            disabled={publicationSubmitting}
                          >
                            {publicationSubmitting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Saving...
                              </>
                            ) : (
                              editingPublication ? 'Update Publication' : 'Create Publication'
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowPublicationForm(false)
                              setEditingPublication(null)
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

            {/* Publications List */}
            {publicationsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-upisha-teal" />
              </div>
            ) : publications.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No publications created yet.</p>
                <p className="text-sm">Click "Add New Publication" to create one.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {publications.map((pub, index) => (
                  <Card key={pub.id || `pub-${index}`} className="dark:bg-gray-800 dark:border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-upisha-navy dark:text-white truncate">
                              {pub.title}
                            </h3>
                            <Badge variant="outline" className="shrink-0 text-xs">{pub.type}</Badge>
                            <Badge variant={pub.isActive !== false ? 'default' : 'secondary'} className="shrink-0 text-xs">
                              {pub.isActive !== false ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          {pub.author && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">By {pub.author}</p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {pub.description}
                          </p>
                          {pub.fileUrl && (
                            <a href={pub.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-upisha-teal mt-2 hover:underline">
                              <ExternalLink className="h-3 w-3" />
                              View PDF
                            </a>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {pub.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                            <Switch
                              checked={pub.isActive !== false}
                              onCheckedChange={async (checked) => {
                                try {
                                  const res = await fetch('/api/publications', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ ...pub, isActive: checked }),
                                  })
                                  if (res.ok) {
                                    toast({ title: checked ? 'Publication activated' : 'Publication deactivated' })
                                    setPublications((prev) => prev.map((p) => p.id === pub.id ? { ...p, isActive: checked } : p))
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
                              onClick={() => handleEditPublication(pub)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeletePublication(pub.id)}
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
          </motion.div>
        ) : (
          <motion.div
            key="submissions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Search + Status Filter */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="relative max-w-sm flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by title, author, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map((s) => (
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
            </div>

            {/* Submissions Table */}
            {submissionsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-upisha-teal" />
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>{searchQuery || statusFilter !== 'all' ? 'No submissions match your filters.' : 'No submissions yet.'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-3 px-3 font-medium text-gray-500 dark:text-gray-400">Title</th>
                      <th className="text-left py-3 px-3 font-medium text-gray-500 dark:text-gray-400">Author</th>
                      <th className="text-left py-3 px-3 font-medium text-gray-500 dark:text-gray-400">Email</th>
                      <th className="text-left py-3 px-3 font-medium text-gray-500 dark:text-gray-400">Type</th>
                      <th className="text-left py-3 px-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-3 font-medium text-gray-500 dark:text-gray-400">Date</th>
                      <th className="text-left py-3 px-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map((sub) => {
                      const st = statusStyles[sub.status || 'pending']
                      return (
                        <tr key={sub.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="py-3 px-3 font-medium text-upisha-navy dark:text-white max-w-[200px] truncate" title={sub.title}>
                            {sub.title}
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-300">{sub.authorName}</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-300">{sub.authorEmail}</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-300">{sub.type}</td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${st.className}`}>
                              {st.label}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-gray-500 dark:text-gray-400 text-xs">
                            {sub.createdAt ? new Date(sub.createdAt.toString()).toLocaleDateString() : '-'}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedSubmission(sub)}
                                className="h-8 w-8 p-0"
                                title="View details"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteSubmission(sub.id)}
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
                  Showing {filteredSubmissions.length} of {submissions.length} submissions
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submission Detail Modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setSelectedSubmission(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b dark:border-gray-700">
                <h3 className="text-lg font-bold text-upisha-navy dark:text-white">Submission Details</h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-upisha-navy dark:text-white">{selectedSubmission.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedSubmission.type}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[selectedSubmission.status || 'pending'].className}`}>
                    {statusStyles[selectedSubmission.status || 'pending'].label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Author</p>
                    <p className="text-gray-700 dark:text-gray-300">{selectedSubmission.authorName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-gray-700 dark:text-gray-300">{selectedSubmission.authorEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Submitted On</p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {selectedSubmission.createdAt ? new Date(selectedSubmission.createdAt.toString()).toLocaleString() : '-'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1">Description</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                    {selectedSubmission.description}
                  </p>
                </div>

                {selectedSubmission.abstract && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Abstract</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                      {selectedSubmission.abstract}
                    </p>
                  </div>
                )}

                {selectedSubmission.fileUrl && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">PDF</p>
                    <a href={selectedSubmission.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="gap-2">
                        <Download className="h-3.5 w-3.5" />
                        View PDF
                      </Button>
                    </a>
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t dark:border-gray-700">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleStatusChange(selectedSubmission.id, 'approved')}
                    disabled={selectedSubmission.status === 'approved'}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-300 text-amber-600 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/30"
                    onClick={() => handleStatusChange(selectedSubmission.id, 'pending')}
                    disabled={selectedSubmission.status === 'pending'}
                  >
                    <Clock3 className="h-3.5 w-3.5 mr-1.5" />
                    Pending
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
                    onClick={() => handleStatusChange(selectedSubmission.id, 'rejected')}
                    disabled={selectedSubmission.status === 'rejected'}
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1.5" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-auto text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30"
                    onClick={() => handleDeleteSubmission(selectedSubmission.id)}
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
    </div>
  )
}