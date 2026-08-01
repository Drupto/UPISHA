'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Users, ExternalLink, Search, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Member {
  id: string
  fullName: string
  email: string
  phone: string
  membershipType: string
  city: string
  status: string
  address?: string | null
  photoUrl?: string | null
  rciCertificateUrl?: string | null
  registrationDate?: string | null
  declaration?: boolean | null
}

export default function AdminMembers() {
  const { toast } = useToast()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members')
      if (res.ok) {
        const data = await res.json()
        setMembers(data.members || [])
      } else {
        setError('Failed to load members')
      }
    } catch {
      setError('Failed to load members')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast({ title: `Member ${status}`, description: `Member has been ${status}.` })
        fetchMembers()
      } else {
        toast({ title: 'Error', description: 'Failed to update member status', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return
    try {
      const res = await fetch(`/api/members/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Member deleted', description: 'The member has been removed.' })
        fetchMembers()
      } else {
        toast({ title: 'Error', description: 'Failed to delete member', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
  }

  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase()
    return (
      m.fullName.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.city.toLowerCase().includes(q) ||
      m.membershipType.toLowerCase().includes(q) ||
      m.status.toLowerCase().includes(q)
    )
  })

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-upisha-teal" /></div>
  if (error) return <div className="text-center py-12 text-red-500">{error} <button onClick={() => window.location.reload()} className="text-upisha-teal hover:underline ml-2">Retry</button></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-upisha-navy dark:text-white mb-2">Members</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {members.length} total members · {members.filter((m) => m.status === 'pending').length} pending
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name, email, city, type, or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredMembers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{searchQuery ? 'No members match your search.' : 'No members yet'}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Photo</th>
                <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Name</th>
                <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Email</th>
                <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Phone</th>
                <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Type</th>
                <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">City</th>
                <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Reg. Date</th>
                <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">RCI Cert</th>
                <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-3">
                    {member.photoUrl ? (
                      <img
                        src={member.photoUrl}
                        alt={member.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-500">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="py-3 font-medium">{member.fullName}</td>
                  <td className="py-3 text-gray-500">{member.email}</td>
                  <td className="py-3 text-gray-500">{member.phone}</td>
                  <td className="py-3"><Badge variant="outline">{member.membershipType}</Badge></td>
                  <td className="py-3 text-gray-500">{member.city}</td>
                  <td className="py-3 text-gray-500 whitespace-nowrap">
                    {member.registrationDate || '-'}
                  </td>
                  <td className="py-3">
                    {member.rciCertificateUrl ? (
                      <a
                        href={member.rciCertificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-upisha-teal hover:underline inline-flex items-center gap-1"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3">
                    <Badge className={member.status === 'approved' ? 'bg-green-100 text-green-700' : member.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}>
                      {member.status || 'pending'}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      {member.status !== 'approved' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(member.id, 'approved')}
                          className="h-8 w-8 p-0 text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/30"
                          title="Approve member"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {member.status !== 'rejected' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(member.id, 'rejected')}
                          className="h-8 w-8 p-0 text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-900/30"
                          title="Reject member"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(member.id)}
                        className="h-8 w-8 p-0 text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30"
                        title="Delete member"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 mt-2">
            Showing {filteredMembers.length} of {members.length} members
          </p>
        </div>
      )}
    </div>
  )
}