'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, User, Mail, Phone, MapPin, Award, Calendar, CreditCard, FileText } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import Link from 'next/link'

interface MemberProfile {
  id: string
  uid?: string | null
  fullName: string
  email: string
  phone: string
  qualification: string
  rciNumber?: string | null
  membershipType: string
  city: string
  transactionNumber?: string | null
  address?: string | null
  photoUrl?: string | null
  rciCertificateUrl?: string | null
  registrationDate?: string | null
  status?: string
  createdAt?: { seconds?: number } | string | null
}

const membershipTypeLabels: Record<string, string> = {
  life: 'Life Member',
  annual: 'Annual Member',
  student: 'Student Member',
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

export default function MemberDashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      if (!user?.uid) return
      try {
        const res = await fetch('/api/members/me')
        if (!res.ok) {
          if (res.status === 404) {
            setError('Member profile not found. Please contact support.')
          } else {
            throw new Error('Failed to fetch member data')
          }
          return
        }
        const data = await res.json()
        setProfile(data.member as MemberProfile)
      } catch {
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [user?.uid])

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
        <Link href="/" className="text-upisha-teal hover:underline">Back to Home</Link>
      </div>
    )
  }

  if (!profile) return null

  const formatDate = (val: unknown) => {
    if (!val) return 'N/A'
    if (typeof val === 'object' && val && 'seconds' in val) {
      return new Date((val as { seconds: number }).seconds * 1000).toLocaleDateString()
    }
    if (typeof val === 'string') return new Date(val).toLocaleDateString()
    return 'N/A'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-upisha-navy dark:text-white">Member Dashboard</h1>
        <Badge className={statusColors[profile.status || 'pending'] || 'bg-gray-100 text-gray-800'}>
          {profile.status ? profile.status.charAt(0).toUpperCase() + profile.status.slice(1) : 'Pending'}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-upisha-navy dark:text-white">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={profile.fullName}
                  className="w-32 h-32 rounded-full object-cover border-4 border-upisha-teal/20"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-upisha-teal/10 flex items-center justify-center">
                  <User className="h-16 w-16 text-upisha-teal" />
                </div>
              )}
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg text-upisha-navy dark:text-white">{profile.fullName}</h3>
              <p className="text-sm text-gray-500">{membershipTypeLabels[profile.membershipType] || profile.membershipType}</p>
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="lg:col-span-2 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-upisha-navy dark:text-white">Membership Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <DetailItem icon={Mail} label="Email" value={profile.email} />
              <DetailItem icon={Phone} label="Phone" value={profile.phone} />
              <DetailItem icon={Award} label="Qualification" value={profile.qualification} />
              <DetailItem icon={MapPin} label="City" value={profile.city} />
              <DetailItem icon={FileText} label="RCI Number" value={profile.rciNumber || 'N/A'} />
              <DetailItem icon={CreditCard} label="Transaction No." value={profile.transactionNumber || 'N/A'} />
              <DetailItem icon={Calendar} label="Registration Date" value={formatDate(profile.registrationDate)} />
              <DetailItem icon={Calendar} label="Joined" value={formatDate(profile.createdAt)} />
            </div>
            {profile.address && (
              <div className="mt-4 pt-4 border-t dark:border-gray-700">
                <DetailItem icon={MapPin} label="Address" value={profile.address} />
              </div>
            )}
            {profile.rciCertificateUrl && (
              <div className="mt-4 pt-4 border-t dark:border-gray-700">
                <a
                  href={profile.rciCertificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-upisha-teal hover:underline text-sm flex items-center gap-1"
                >
                  <FileText className="h-4 w-4" />
                  View RCI Certificate
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid sm:grid-cols-3 gap-4">
        <Link href="/member/events">
          <Card className="hover:shadow-md transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-100 text-purple-600">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-upisha-navy dark:text-white">Events</p>
                <p className="text-sm text-gray-500">View upcoming events</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/member/webinars">
          <Card className="hover:shadow-md transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-indigo-100 text-indigo-600">
                <Loader2 className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-upisha-navy dark:text-white">Webinars</p>
                <p className="text-sm text-gray-500">Browse webinars</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/member/announcements">
          <Card className="hover:shadow-md transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-100 text-orange-600">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-upisha-navy dark:text-white">Announcements</p>
                <p className="text-sm text-gray-500">Latest updates</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}

function DetailItem({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-upisha-teal/10 shrink-0">
        <Icon className="h-4 w-4 text-upisha-teal" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm font-medium text-upisha-navy dark:text-white break-words">{value}</p>
      </div>
    </div>
  )
}