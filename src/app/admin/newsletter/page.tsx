'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, Trash2, Search, Loader2, Mail, Download, Plus, Pencil, Send, Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { csrfHeaders } from '@/lib/csrf'

interface Subscriber {
  id: string
  email: string
  isActive?: boolean
  createdAt?: Date
}

interface Campaign {
  id: string
  title: string
  subject: string
  content: string
  status: 'draft' | 'sent'
  sentAt?: Date | null
  createdAt?: Date
  updatedAt?: Date
}

export default function AdminNewsletterPage() {
  const { toast } = useToast()
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [campaignsLoading, setCampaignsLoading] = useState(false)
  const [showCampaignForm, setShowCampaignForm] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    subject: '',
    content: '',
    status: 'draft' as 'draft' | 'sent',
  })
  const [campaignSubmitting, setCampaignSubmitting] = useState(false)

  const fetchSubscribers = async () => {
    try {
      const res = await fetch('/api/newsletter')
      if (res.ok) {
        const data = await res.json()
        setSubscribers(data.subscribers || [])
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load subscribers', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const fetchCampaigns = async () => {
    setCampaignsLoading(true)
    try {
      const res = await fetch('/api/newsletter/campaigns')
      if (res.ok) {
        const data = await res.json()
        setCampaigns(data.campaigns || [])
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load campaigns', variant: 'destructive' })
    } finally {
      setCampaignsLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscribers()
  }, [])

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm('Are you sure you want to remove this subscriber?')) return
    try {
      const res = await fetch(`/api/newsletter/${id}`, {
        method: 'DELETE',
        headers: csrfHeaders(),
      })
      if (res.ok) {
        toast({ title: 'Subscriber removed', description: 'The subscriber has been removed.' })
        fetchSubscribers()
      } else {
        toast({ title: 'Error', description: 'Failed to remove subscriber', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
  }

  const handleCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!campaignForm.title || !campaignForm.subject || !campaignForm.content) {
      toast({ title: 'Validation error', description: 'Please fill all required fields', variant: 'destructive' })
      return
    }
    setCampaignSubmitting(true)
    try {
      const url = editingCampaign ? `/api/newsletter/campaigns/${editingCampaign.id}` : '/api/newsletter/campaigns'
      const method = editingCampaign ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: csrfHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(campaignForm),
      })

      if (res.ok) {
        toast({
          title: editingCampaign ? 'Campaign updated' : 'Campaign created',
          description: editingCampaign ? 'The campaign has been updated.' : 'A new campaign has been created.',
        })
        setShowCampaignForm(false)
        setEditingCampaign(null)
        setCampaignForm({ title: '', subject: '', content: '', status: 'draft' })
        fetchCampaigns()
      } else {
        const err = await res.json().catch(() => ({}))
        toast({ title: 'Error', description: err.error || 'Operation failed', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error. Please try again.', variant: 'destructive' })
    } finally {
      setCampaignSubmitting(false)
    }
  }

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setCampaignForm({
      title: campaign.title,
      subject: campaign.subject,
      content: campaign.content,
      status: campaign.status,
    })
    setShowCampaignForm(true)
  }

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return
    try {
      const res = await fetch(`/api/newsletter/campaigns/${id}`, {
        method: 'DELETE',
        headers: csrfHeaders(),
      })
      if (res.ok) {
        toast({ title: 'Campaign deleted', description: 'The campaign has been removed.' })
        fetchCampaigns()
      } else {
        toast({ title: 'Error', description: 'Failed to delete campaign', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
  }

  const handleMarkSent = async (id: string) => {
    try {
      const res = await fetch(`/api/newsletter/campaigns/${id}`, {
        method: 'PUT',
        headers: csrfHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ status: 'sent' }),
      })
      if (res.ok) {
        toast({ title: 'Campaign marked as sent' })
        fetchCampaigns()
      } else {
        toast({ title: 'Error', description: 'Failed to update campaign', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
  }

  const exportSubscribersCSV = () => {
    const rows = [
      ['Email', 'Subscribed Date', 'Status'],
      ...filteredSubscribers.map((s) => [
        s.email,
        s.createdAt ? new Date(s.createdAt.toString()).toLocaleDateString() : '',
        s.isActive !== false ? 'Active' : 'Inactive',
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'newsletter-subscribers.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Plain computation — React Compiler auto-memoizes it; the previous manual
  // useMemo could not be preserved by the compiler (lint error).
  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeSubscribersCount = subscribers.filter((s) => s.isActive !== false).length
  const totalCampaigns = campaigns.length
  const sentCampaigns = campaigns.filter((c) => c.status === 'sent').length
  const draftCampaigns = campaigns.filter((c) => c.status === 'draft').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-upisha-navy dark:text-white">Newsletter</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage newsletter subscribers and campaigns
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Subscribers</p>
            <p className="text-xl font-bold text-upisha-navy dark:text-white">{subscribers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
            <p className="text-xl font-bold text-green-600">{activeSubscribersCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">Campaigns</p>
            <p className="text-xl font-bold text-upisha-navy dark:text-white">{totalCampaigns}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">Drafts / Sent</p>
            <p className="text-xl font-bold text-upisha-navy dark:text-white">{draftCampaigns} / {sentCampaigns}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subscribers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscribers" className="gap-2">
            <Users className="h-4 w-4" /> Subscribers
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-2">
            <Mail className="h-4 w-4" /> Campaigns
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              onClick={exportSubscribersCSV}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-upisha-teal" />
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>{searchQuery ? 'No subscribers match your search.' : 'No subscribers yet.'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-3 font-medium text-gray-500 dark:text-gray-400">Email</th>
                    <th className="text-left py-3 px-3 font-medium text-gray-500 dark:text-gray-400">Subscribed Date</th>
                    <th className="text-left py-3 px-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.map((sub) => (
                    <tr key={sub.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-3 font-medium text-upisha-navy dark:text-white flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                        {sub.email}
                      </td>
                      <td className="py-3 px-3 text-gray-500 dark:text-gray-400 text-xs">
                        {sub.createdAt ? new Date(sub.createdAt.toString()).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          sub.isActive !== false
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {sub.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSubscriber(sub.id)}
                          className="h-8 w-8 p-0 text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-400 mt-2">
                Showing {filteredSubscribers.length} of {subscribers.length} subscribers
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-upisha-navy dark:text-white">Newsletter Campaigns</h3>
            <Button
              onClick={() => {
                setEditingCampaign(null)
                setCampaignForm({ title: '', subject: '', content: '', status: 'draft' })
                setShowCampaignForm(!showCampaignForm)
              }}
              className="bg-upisha-teal hover:bg-upisha-teal-dark text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {showCampaignForm ? 'Cancel' : 'New Campaign'}
            </Button>
          </div>

          <AnimatePresence>
            {showCampaignForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-6"
              >
                <Card>
                  <CardContent className="p-4">
                    <form onSubmit={handleCampaignSubmit} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                            Title *
                          </label>
                          <Input
                            required
                            placeholder="Internal campaign title"
                            value={campaignForm.title}
                            onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                            Email Subject *
                          </label>
                          <Input
                            required
                            placeholder="Subject line for the email"
                            value={campaignForm.subject}
                            onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                          Content *
                        </label>
                        <Textarea
                          placeholder="Newsletter content..."
                          value={campaignForm.content}
                          onChange={(e) => setCampaignForm({ ...campaignForm, content: e.target.value })}
                          rows={6}
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Mark as sent once dispatched</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={campaignForm.status === 'draft' ? 'secondary' : 'default'}>
                            {campaignForm.status === 'draft' ? 'Draft' : 'Sent'}
                          </Badge>
                          <Switch
                            checked={campaignForm.status === 'sent'}
                            onCheckedChange={(checked) => setCampaignForm({ ...campaignForm, status: checked ? 'sent' : 'draft' })}
                          />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          type="submit"
                          className="bg-upisha-teal hover:bg-upisha-teal-dark text-white"
                          disabled={campaignSubmitting}
                        >
                          {campaignSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Saving...
                            </>
                          ) : (
                            editingCampaign ? 'Update Campaign' : 'Create Campaign'
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowCampaignForm(false)
                            setEditingCampaign(null)
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

          {campaignsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-upisha-teal" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Mail className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No campaigns yet.</p>
              <p className="text-sm">Create a draft to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-upisha-navy dark:text-white truncate">
                            {campaign.title}
                          </h3>
                          <Badge variant={campaign.status === 'sent' ? 'default' : 'secondary'} className="shrink-0 text-xs">
                            {campaign.status === 'sent' ? 'Sent' : 'Draft'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Subject: {campaign.subject}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {campaign.content}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Created: {campaign.createdAt ? new Date(campaign.createdAt.toString()).toLocaleDateString() : '-'}
                          {campaign.sentAt && ` · Sent: ${new Date(campaign.sentAt.toString()).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="flex gap-2">
                          {campaign.status === 'draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkSent(campaign.id)}
                              className="h-8 w-8 p-0"
                              title="Mark as sent"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCampaign(campaign)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCampaign(campaign.id)}
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
        </TabsContent>
      </Tabs>
    </div>
  )
}