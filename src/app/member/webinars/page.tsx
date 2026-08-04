'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Monitor, Loader2, Clock, User, Calendar, ExternalLink, CheckCircle2, XCircle, Clock3, Users } from 'lucide-react'
import Link from 'next/link'

interface WebinarItem {
  id: string
  title: string
  date: string
  time: string
  speaker: string
  duration: string
  description?: string | null
  registrationLink?: string | null
  isActive?: boolean
  maxAttendees?: number | null
  registrationCount?: number
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
  status?: 'pending' | 'confirmed' | 'rejected'
  createdAt?: Date
}

const statusStyles: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: <Clock3 className="h-3 w-3" /> },
  confirmed: { label: 'Confirmed', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', icon: <CheckCircle2 className="h-3 w-3" /> },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', icon: <XCircle className="h-3 w-3" /> },
}

export default function MemberWebinarsPage() {
  const [webinars, setWebinars] = useState<WebinarItem[]>([])
  const [myRegistrations, setMyRegistrations] = useState<RegistrationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [registrationsLoading, setRegistrationsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchWebinars() {
      try {
        const res = await fetch('/api/webinars')
        if (!res.ok) throw new Error('Failed to fetch webinars')
        const data = await res.json()
        setWebinars((data.webinars as WebinarItem[]).filter((w) => w.isActive !== false))
      } catch {
        setError('Failed to load webinars')
      } finally {
        setLoading(false)
      }
    }
    fetchWebinars()
  }, [])

  useEffect(() => {
    async function fetchMyRegistrations() {
      try {
        const res = await fetch('/api/webinars/register/mine')
        if (res.ok) {
          const data = await res.json()
          setMyRegistrations(data.registrations || [])
        }
      } catch {
        // Silently fail - user may not be authenticated
      } finally {
        setRegistrationsLoading(false)
      }
    }
    fetchMyRegistrations()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-upisha-teal" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-upisha-navy dark:text-white mb-6">Webinars</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {webinars.length === 0 ? (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-12 text-center text-gray-500">
              <Monitor className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              No webinars scheduled at this time.
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {webinars.map((webinar) => {
              const count = webinar.registrationCount ?? 0
              const isFull = webinar.maxAttendees ? count >= webinar.maxAttendees : false
              return (
                <Card key={webinar.id} className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-upisha-navy dark:text-white">{webinar.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Calendar className="h-4 w-4 text-upisha-teal" />
                      {new Date(webinar.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Clock className="h-4 w-4 text-upisha-teal" />
                      {webinar.time} ({webinar.duration})
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <User className="h-4 w-4 text-upisha-teal" />
                      {webinar.speaker}
                    </div>
                    {webinar.maxAttendees && (
                      <div className={`flex items-center gap-2 text-sm ${isFull ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`}>
                        <Users className="h-4 w-4 text-upisha-teal" />
                        {isFull ? 'Registration full' : `${webinar.maxAttendees - count} seats remaining`}
                      </div>
                    )}
                    {webinar.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{webinar.description}</p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Link href={`/webinars/register?webinarId=${webinar.id || ''}&webinarTitle=${encodeURIComponent(webinar.title)}`}>
                        <Button size="sm" className="bg-upisha-teal hover:bg-upisha-teal-dark text-white" disabled={isFull}>
                          {isFull ? 'Full' : 'Register'}
                        </Button>
                      </Link>
                      {webinar.registrationLink && (
                        <a href={webinar.registrationLink} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                            Join
                          </Button>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* My Registrations */}
      <div>
        <h2 className="text-xl font-bold text-upisha-navy dark:text-white mb-4">My Registrations</h2>
        {registrationsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-upisha-teal" />
          </div>
        ) : myRegistrations.length === 0 ? (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-8 text-center text-gray-500">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              You haven't registered for any webinars yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {myRegistrations.map((reg) => {
              const st = statusStyles[reg.status || 'pending']
              return (
                <Card key={reg.id} className="dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-upisha-navy dark:text-white truncate">
                            {reg.webinarTitle}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${st.className}`}>
                            {st.icon}
                            {st.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {reg.createdAt ? new Date(reg.createdAt.toString()).toLocaleDateString() : '-'}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" /> {reg.fullName}
                          </span>
                          {reg.transactionNumber && (
                            <span className="font-mono">Txn: {reg.transactionNumber}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}