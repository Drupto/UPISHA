'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Users, ExternalLink, Search, Trash2, CheckCircle2, XCircle, Pencil, Download } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { sendMemberApprovalEmail } from '@/lib/email'

interface Member {
  id: string
  fullName: string
  email: string
  phone: string
  membershipType: string
  city: string
  status: string
  transactionNumber?: string | null
  createdAt?: string | Date | null
  address?: string | null
  photoUrl?: string | null
  rciCertificateUrl?: string | null
  registrationDate?: string | null
  declaration?: boolean | null
}

interface EditForm {
  fullName: string
  email: string
  phone: string
  membershipType: string
  city: string
  address: string
  status: string
}

const membershipTypes = ['life', 'annual', 'student']
const statuses = ['pending', 'approved', 'rejected']

export default function AdminMembers() {
  const { toast } = useToast()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({
    fullName: '',
    email: '',
    phone: '',
    membershipType: '',
    city: '',
    address: '',
    status: '',
  })
  const [saving, setSaving] = useState(false)

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
        
        // Send email notification to member
        const member = members.find(m => m.id === id)
        if (member && (status === 'approved' || status === 'rejected')) {
          await sendMemberApprovalEmail(member.email, member.fullName, status)
        }
        
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

  const openEditDialog = (member: Member) => {
    setEditingMember(member)
    setEditForm({
      fullName: member.fullName || '',
      email: member.email || '',
      phone: member.phone || '',
      membershipType: member.membershipType || '',
      city: member.city || '',
      address: member.address || '',
      status: member.status || 'pending',
    })
  }

  const handleEditSave = async () => {
    if (!editingMember) return
    setSaving(true)
    try {
      const res = await fetch(`/api/members/${editingMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editForm.fullName,
          email: editForm.email,
          phone: editForm.phone,
          membershipType: editForm.membershipType,
          city: editForm.city,
          address: editForm.address,
          status: editForm.status,
        }),
      })
      if (res.ok) {
        toast({ title: 'Member updated', description: 'Member profile has been updated.' })
        setEditingMember(null)
        fetchMembers()
      } else {
        const errData = await res.json().catch(() => ({}))
        toast({ title: 'Update failed', description: errData.error || 'Please try again.', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase()
    return (
      m.id.toLowerCase().includes(q) ||
      m.fullName.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.city.toLowerCase().includes(q) ||
      m.membershipType.toLowerCase().includes(q) ||
      m.status.toLowerCase().includes(q)
    )
  })

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + itemsPerPage)

  const exportMembersCSV = () => {
    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Membership Type', 'City', 'Address', 'Registration Date', 'Txn Number', 'Entry Date', 'Status']
    const rows = filteredMembers.map(m => [
      m.id,
      m.fullName,
      m.email,
      m.phone,
      m.membershipType,
      m.city,
      m.address || '',
      m.registrationDate || '',
      m.transactionNumber || '',
      m.createdAt ? (() => {
        try {
          const d = new Date(m.createdAt as string | Date)
          return isNaN(d.getTime()) ? '' : d.toLocaleDateString()
        } catch { return '' }
      })() : '',
      m.status || 'pending'
    ])
    const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `members-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: 'Export successful', description: `Exported ${filteredMembers.length} members to CSV` })
  }

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
          placeholder="Search by ID, name, email, city, type, or status..."
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
        <>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredMembers.length)} of {filteredMembers.length} members
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportMembersCSV}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">ID</th>
                  <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Photo</th>
                  <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Name</th>
                  <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Email</th>
                  <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Phone</th>
                  <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Type</th>
                  <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">City</th>
                  <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Reg. Date</th>
                  <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">RCI Cert</th>
                  <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Txn Number</th>
                  <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Entry Date</th>
                  <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMembers.map((member) => (
                  <tr key={member.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 font-mono text-xs text-gray-500">{member.id}</td>
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
                    <td className="py-3 text-gray-500 whitespace-nowrap">
                      {member.transactionNumber || '-'}
                    </td>
                    <td className="py-3 text-gray-500 whitespace-nowrap">
                      {(() => {
                        try {
                          if (!member.createdAt) return '-'
                          const dateStr = typeof member.createdAt === 'string' ? member.createdAt : 
                                         member.createdAt instanceof Date ? member.createdAt.toISOString() :
                                         String(member.createdAt)
                          const date = new Date(dateStr)
                          return isNaN(date.getTime()) ? '-' : date.toLocaleDateString()
                        } catch {
                          return '-'
                        }
                      })()}
                    </td>
                    <td className="py-3">
                      <Badge className={member.status === 'approved' ? 'bg-green-100 text-green-700' : member.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}>
                        {member.status || 'pending'}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(member)}
                          className="h-8 w-8 p-0 text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/30"
                          title="Edit member"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
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
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Rows per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="text-sm border rounded-md px-2 py-1 dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Member Dialog */}
      <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>
              Update member profile details. Changes will be reflected on the member's dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-fullName">Full Name</Label>
                <Input
                  id="edit-fullName"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-city">City</Label>
                <Input
                  id="edit-city"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Membership Type</Label>
                <Select
                  value={editForm.membershipType}
                  onValueChange={(value) => setEditForm({ ...editForm, membershipType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {membershipTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Textarea
                id="edit-address"
                rows={3}
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMember(null)} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={saving || !editForm.fullName || !editForm.email || !editForm.phone || !editForm.city}
              className="bg-upisha-teal hover:bg-upisha-teal-dark text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}