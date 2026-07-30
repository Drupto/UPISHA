'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Users, ExternalLink } from 'lucide-react'

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
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/members')
      .then(r => r.json())
      .then(data => { setMembers(data.members || []); setLoading(false) })
      .catch(() => { setError('Failed to load members'); setLoading(false) })
  }, [])

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-upisha-teal" /></div>
  if (error) return <div className="text-center py-12 text-red-500">{error} <button onClick={() => window.location.reload()} className="text-upisha-teal hover:underline ml-2">Retry</button></div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-upisha-navy dark:text-white mb-6">Members</h1>
      {members.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No members yet</p>
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
                <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Address</th>
                <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Reg. Date</th>
                <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">RCI Cert</th>
                <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Declaration</th>
                <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
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
                  <td className="py-3 text-gray-500 max-w-[200px] truncate" title={member.address || ''}>
                    {member.address || '-'}
                  </td>
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
                    {member.declaration ? (
                      <Badge className="bg-green-100 text-green-700">Accepted</Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3">
                    <Badge className={member.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                      {member.status || 'pending'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}