'use client'

import { useState, useEffect } from 'react'
import { Bell, Trash2, Search, Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface Subscriber {
  id: string
  email: string
  isActive?: boolean
  createdAt?: Date
}

export default function AdminNewsletterPage() {
  const { toast } = useToast()
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

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

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this subscriber?')) return
    try {
      const res = await fetch(`/api/newsletter/${id}`, { method: 'DELETE' })
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

  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-upisha-navy dark:text-white">Newsletter</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage newsletter subscribers ({subscribers.length} total)
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
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
                      onClick={() => handleDelete(sub.id)}
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
    </div>
  )
}