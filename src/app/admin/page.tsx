'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Mail, Calendar, Bell, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  members: number
  messages: number
  events: number
  subscribers: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({ members: 0, messages: 0, events: 0, subscribers: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [membersRes, messagesRes, eventsRes, newsletterRes] = await Promise.allSettled([
          fetch('/api/members').then(r => r.json()),
          fetch('/api/contact').then(r => r.json()),
          fetch('/api/events').then(r => r.json()),
          fetch('/api/newsletter').then(r => r.json()),
        ])

        setStats({
          members: membersRes.status === 'fulfilled' ? (membersRes.value as { members?: unknown[] }).members?.length || 0 : 0,
          messages: messagesRes.status === 'fulfilled' ? (messagesRes.value as { messages?: unknown[] }).messages?.length || 0 : 0,
          events: eventsRes.status === 'fulfilled' ? (eventsRes.value as { events?: unknown[] }).events?.length || 0 : 0,
          subscribers: newsletterRes.status === 'fulfilled' ? (newsletterRes.value as { count?: number }).count || 0 : 0,
        })
      } catch {
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

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
        <button onClick={() => window.location.reload()} className="text-upisha-teal hover:underline">Retry</button>
      </div>
    )
  }

  const statCards = [
    { label: 'Total Members', value: stats.members, icon: Users, href: '/admin/members', color: 'text-blue-600 bg-blue-100' },
    { label: 'Messages', value: stats.messages, icon: Mail, href: '/admin/messages', color: 'text-green-600 bg-green-100' },
    { label: 'Events', value: stats.events, icon: Calendar, href: '/admin/events', color: 'text-purple-600 bg-purple-100' },
    { label: 'Newsletter Subscribers', value: stats.subscribers, icon: Bell, href: '/admin/newsletter', color: 'text-amber-600 bg-amber-100' },
  ] as const

  return (
    <div>
      <h1 className="text-2xl font-bold text-upisha-navy dark:text-white mb-6">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Link key={card.label} href={card.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                      <p className="text-3xl font-bold text-upisha-navy dark:text-white mt-1">{card.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}