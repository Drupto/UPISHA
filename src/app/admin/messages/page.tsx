'use client'

import { useState, useEffect } from 'react'
import { Mail, Trash2, Search, Loader2, MailOpen, CheckCheck, Eye, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface Message {
  id: string
  name: string
  email: string
  subject: string
  message: string
  isRead?: boolean
  createdAt?: Date
}

export default function AdminMessagesPage() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/contact')
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load messages', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const handleMarkRead = async (id: string, isRead: boolean) => {
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: !isRead }),
      })
      if (res.ok) {
        toast({ title: isRead ? 'Marked as unread' : 'Marked as read' })
        fetchMessages()
      } else {
        toast({ title: 'Error', description: 'Failed to update message', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return
    try {
      const res = await fetch(`/api/contact/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Message deleted', description: 'The message has been removed.' })
        setSelectedMessage(null)
        fetchMessages()
      } else {
        toast({ title: 'Error', description: 'Failed to delete message', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
  }

  const filteredMessages = messages.filter((m) => {
    const q = searchQuery.toLowerCase()
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q)
    )
  })

  const unreadCount = messages.filter((m) => !m.isRead).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-upisha-navy dark:text-white">Messages</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {messages.length} total messages · {unreadCount} unread
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name, email, or subject..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-upisha-teal" />
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Mail className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>{searchQuery ? 'No messages match your search.' : 'No messages yet.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((msg) => (
            <Card
              key={msg.id}
              className={`dark:bg-gray-800 dark:border-gray-700 cursor-pointer transition-shadow hover:shadow-md ${
                !msg.isRead ? 'border-upisha-teal/30 bg-upisha-teal/5' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => {
                      setSelectedMessage(msg)
                      if (!msg.isRead) handleMarkRead(msg.id, false)
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {!msg.isRead && (
                        <span className="w-2 h-2 rounded-full bg-upisha-teal shrink-0" />
                      )}
                      <h3 className="font-semibold text-upisha-navy dark:text-white truncate">
                        {msg.subject}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium">{msg.name}</span>
                      <span>{msg.email}</span>
                      <span>{msg.createdAt ? new Date(msg.createdAt.toString()).toLocaleDateString() : '-'}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-1">
                      {msg.message}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedMessage(msg)}
                      className="h-8 w-8 p-0"
                      title="View message"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkRead(msg.id, !!msg.isRead)}
                      className="h-8 w-8 p-0"
                      title={msg.isRead ? 'Mark as unread' : 'Mark as read'}
                    >
                      {msg.isRead ? <Mail className="h-3.5 w-3.5" /> : <MailOpen className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(msg.id)}
                      className="h-8 w-8 p-0 text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30"
                      title="Delete message"
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

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedMessage(null)}
        >
          <Card
            className="w-full max-w-2xl max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-upisha-navy dark:text-white">
                    {selectedMessage.subject}
                  </h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span className="font-medium">{selectedMessage.name}</span>
                    <span>{selectedMessage.email}</span>
                    <span>{selectedMessage.createdAt ? new Date(selectedMessage.createdAt.toString()).toLocaleString() : '-'}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMessage(null)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => handleMarkRead(selectedMessage.id, !!selectedMessage.isRead)}
                >
                  {selectedMessage.isRead ? (
                    <><Mail className="h-4 w-4 mr-2" /> Mark as Unread</>
                  ) : (
                    <><MailOpen className="h-4 w-4 mr-2" /> Mark as Read</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
                <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}>
                  <Button className="bg-upisha-teal hover:bg-upisha-teal-dark text-white">
                    <Mail className="h-4 w-4 mr-2" /> Reply
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}