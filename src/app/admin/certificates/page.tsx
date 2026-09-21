'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Award, Search, Trash2, Plus, Ban, Eye, Link2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { csrfHeaders } from '@/lib/csrf'

interface CertificateItem {
  id: string
  templateId: string
  type?: 'membership' | 'webinar'
  memberId: string
  memberName: string
  membershipType?: string | null
  webinarTitle?: string | null
  certificateNumber: string
  issueDate: string
  status?: string
}

interface TemplateItem {
  id: string
  name: string
  accountType: string
  category?: string
  isActive?: boolean
}

interface MemberItem {
  id: string
  fullName: string
  email: string
  membershipType: string
  status: string
  uid?: string | null
}

// Guarded date rendering — a missing/invalid issueDate renders as an em dash
// instead of the literal "Invalid Date" (same pattern as the verify page).
function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) return '—'
  const d = new Date(isoDate)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function AdminCertificates() {
  const { toast } = useToast()
  const [certificates, setCertificates] = useState<CertificateItem[]>([])
  const [templates, setTemplates] = useState<TemplateItem[]>([])
  const [members, setMembers] = useState<MemberItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [issueOpen, setIssueOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [issuing, setIssuing] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [])

  // Hoisted function declaration: the effect below calls this before its
  // old const-declaration position (TDZ — React Compiler lint error).
  async function fetchAll() {
    setLoading(true)
    try {
      const [certRes, templateRes, memberRes] = await Promise.all([
        fetch('/api/certificates'),
        fetch('/api/certificates/templates'),
        fetch('/api/members'),
      ])

      // Surface auth/server failures instead of silently rendering empty lists
      if (!certRes.ok || !templateRes.ok || !memberRes.ok) {
        throw new Error('Could not load certificates, templates, or members. Please refresh the page — if this keeps happening, sign in again and retry.')
      }

      const certData = await certRes.json()
      const templateData = await templateRes.json()
      const memberData = await memberRes.json()

      setCertificates(certData.certificates || [])
      setTemplates(templateData.templates || [])
      // Only approved members with a linked user account can be issued a
      // certificate (the API rejects members without a uid with a 400).
      setMembers((memberData.members || []).filter((m: MemberItem) => m.status === 'approved' && !!m.uid))
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Could not load the certificates page. Please refresh and try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleIssueCertificate = async () => {
    if (!selectedMember || !selectedTemplate) {
      toast({ title: 'Error', description: 'Please select a member and template', variant: 'destructive' })
      return
    }

    setIssuing(true)
    try {
      // /api/certificates enforces CSRF double-submit — the x-csrf-token header
      // must match the csrf-token cookie, otherwise the request 403s.
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: csrfHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ memberId: selectedMember, templateId: selectedTemplate }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Could not issue the certificate. Please check your connection and try again.')
      }

      toast({ title: 'Success', description: 'Certificate issued. The member can now view and download it from their profile.' })
      setIssueOpen(false)
      setSelectedMember('')
      setSelectedTemplate('')
      fetchAll()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Could not issue the certificate. Please check your connection and try again.', variant: 'destructive' })
    } finally {
      setIssuing(false)
    }
  }

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this certificate?')) return
    try {
      // PUT is CSRF-protected server-side — the x-csrf-token header must match
      // the csrf-token cookie, otherwise the request 403s.
      const res = await fetch(`/api/certificates/${id}`, {
        method: 'PUT',
        headers: csrfHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ status: 'revoked' }),
      })
      if (res.ok) {
        toast({ title: 'Certificate revoked', description: 'The certificate has been revoked.' })
        fetchAll()
      } else {
        const err = await res.json().catch(() => ({}))
        toast({ title: 'Error', description: err.error || 'Failed to revoke certificate', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return
    try {
      // DELETE is CSRF-protected server-side (double-submit cookie pattern).
      const res = await fetch(`/api/certificates/${id}`, { method: 'DELETE', headers: csrfHeaders() })
      if (res.ok) {
        toast({ title: 'Certificate deleted', description: 'The certificate has been removed.' })
        fetchAll()
      } else {
        const err = await res.json().catch(() => ({}))
        toast({ title: 'Error', description: err.error || 'Failed to delete certificate', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
  }

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/verify/${id}`
    navigator.clipboard
      .writeText(url)
      .then(() =>
        toast({ title: 'Link copied', description: 'Certificate verification link copied to clipboard.' })
      )
      .catch(() =>
        toast({
          title: 'Error',
          description: 'Could not copy the link. View the certificate and copy it from the address bar instead.',
          variant: 'destructive',
        })
      )
  }

  const filteredCertificates = certificates.filter((c) => {
    const q = searchQuery.toLowerCase()
    const typeLabel = c.type === 'webinar' ? 'webinar' : ''
    const membershipLabel = (c.membershipType || '').toLowerCase()
    const webinarLabel = (c.webinarTitle || '').toLowerCase()
    return (
      c.memberName.toLowerCase().includes(q) ||
      c.certificateNumber.toLowerCase().includes(q) ||
      membershipLabel.includes(q) ||
      typeLabel.includes(q) ||
      webinarLabel.includes(q) ||
      (c.status || '').toLowerCase().includes(q)
    )
  })

  const membershipTemplates = templates.filter(
    (t) => t.isActive !== false && (t.category || 'membership') === 'membership'
  )

  const activeCount = certificates.filter((c) => c.status !== 'revoked').length
  const revokedCount = certificates.length - activeCount

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-upisha-teal" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-upisha-navy dark:text-white">Certificates</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {activeCount} active · {revokedCount} revoked
          </p>
        </div>
        <Button
          onClick={() => setIssueOpen(true)}
          className="bg-upisha-teal hover:bg-upisha-teal-dark text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Issue Certificate
        </Button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search certificates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filteredCertificates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchQuery ? 'No certificates match your search.' : 'No certificates issued yet.'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Certificates are auto-issued when members are approved, or you can issue manually.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 pr-4 font-semibold text-gray-600 dark:text-gray-400">Member</th>
                <th className="pb-3 pr-4 font-semibold text-gray-600 dark:text-gray-400">Cert. Number</th>
                <th className="pb-3 pr-4 font-semibold text-gray-600 dark:text-gray-400">Type</th>
                <th className="pb-3 pr-4 font-semibold text-gray-600 dark:text-gray-400">Issue Date</th>
                <th className="pb-3 pr-4 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCertificates.map((cert) => (
                <tr key={cert.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-3 pr-4 font-medium">{cert.memberName}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-gray-500">{cert.certificateNumber}</td>
                  <td className="py-3 pr-4">
                    {cert.type === 'webinar' ? (
                      <Badge className="bg-upisha-teal/10 text-upisha-teal">Webinar</Badge>
                    ) : (
                      <Badge variant="outline">{cert.membershipType || 'Membership'}</Badge>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-gray-500">
                    {formatDate(cert.issueDate)}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge className={cert.status === 'revoked' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                      {cert.status === 'revoked' ? 'Revoked' : 'Active'}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => window.open(`/verify/${cert.id}`, '_blank', 'noopener,noreferrer')}
                        title="View certificate"
                      >
                        <Eye className="h-3.5 w-3.5 text-upisha-teal" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleCopyLink(cert.id)}
                        title="Copy verification link"
                      >
                        <Link2 className="h-3.5 w-3.5 text-gray-500" />
                      </Button>
                      {cert.status !== 'revoked' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleRevoke(cert.id)}
                          title="Revoke certificate"
                        >
                          <Ban className="h-3.5 w-3.5 text-amber-600" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDelete(cert.id)}
                        title="Delete certificate"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Issue Certificate Dialog */}
      <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Issue Certificate</DialogTitle>
            <DialogDescription>
              Pick an approved member and a membership certificate template. The certificate is saved immediately and appears in the member profile, where the member can view and download it. Each member can hold only one active certificate.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Select Member</Label>
              {members.length === 0 ? (
                <div className="text-sm text-gray-500 border rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
                  No eligible members yet. Members appear here once their application is approved and they have registered a user account.
                </div>
              ) : (
                <Select value={selectedMember} onValueChange={setSelectedMember}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.fullName} ({m.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <p className="text-xs text-gray-400">
                If a member is missing from this list, check that their application is approved on the Members page and that they have registered an account. Certificates need a linked account so members can view them.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Select Template</Label>
              {membershipTemplates.length === 0 ? (
                <div className="text-sm text-gray-500 border rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
                  No membership certificate templates found. Create one in{' '}
                  <a href="/admin/certificates/templates" className="text-upisha-teal hover:underline">
                    Certificate Templates
                  </a>{' '}
                  first.
                </div>
              ) : (
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {membershipTemplates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} ({t.accountType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIssueOpen(false)} disabled={issuing}>
              Cancel
            </Button>
            <Button
              onClick={handleIssueCertificate}
              disabled={issuing || !selectedMember || !selectedTemplate}
              className="bg-upisha-teal hover:bg-upisha-teal-dark text-white"
            >
              {issuing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Issuing...
                </>
              ) : (
                'Issue Certificate'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}