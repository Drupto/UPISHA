'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Plus, Trash2, Pencil } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import CertificatePreview from '@/components/certificates/CertificatePreview'
import { sanitizeFormData } from '@/lib/sanitize'
import { csrfHeaders } from '@/lib/csrf'
import type { CertificateTemplateDoc, CertificateTextBlock, CertificateHeaderFont } from '@/lib/types'

interface TemplateForm {
  name: string
  accountType: string
  category: string
  title: string
  subtitle: string
  titleFont: CertificateHeaderFont
  subtitleFont: CertificateHeaderFont
  textBlocks: CertificateTextBlock[]
  footerText: string
  logoUrl: string
  signatureUrl: string
  stampUrl: string
  backgroundUrl: string
  borderColor: string
  accentColor: string
  fontFamily: string
  isActive: boolean
  isDefault: boolean
}

const emptyBlock = (): CertificateTextBlock => ({
  id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  content: '',
  fontSize: 18,
  fontWeight: 'normal',
  fontStyle: 'normal',
  textAlign: 'center',
  color: '#374151',
  marginTop: 8,
  marginBottom: 8,
})

const defaultTitleFont: CertificateHeaderFont = {
  fontSize: 32,
  fontWeight: 'bold',
  fontStyle: 'normal',
  textAlign: 'center',
  color: '#b45309',
  letterSpacing: 0.02,
}

const defaultSubtitleFont: CertificateHeaderFont = {
  fontSize: 16,
  fontWeight: 'normal',
  fontStyle: 'normal',
  textAlign: 'center',
  color: '#6b7280',
  letterSpacing: 0.05,
}

const emptyForm: TemplateForm = {
  name: '',
  accountType: 'life',
  category: 'membership',
  title: 'Certificate of Membership',
  subtitle: 'UP ISHA — Uttar Pradesh Indian Speech & Hearing Association',
  titleFont: defaultTitleFont,
  subtitleFont: defaultSubtitleFont,
  textBlocks: [emptyBlock()],
  footerText: 'Secretary, UP ISHA',
  logoUrl: '/images/upishalogo.png',
  signatureUrl: '',
  stampUrl: '',
  backgroundUrl: '',
  borderColor: '#0d9488',
  accentColor: '#b45309',
  fontFamily: 'serif',
  isActive: true,
  isDefault: false,
}

export default function AdminCertificateTemplates() {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<CertificateTemplateDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<CertificateTemplateDoc | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<TemplateForm>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const signatureInputRef = useRef<HTMLInputElement>(null)
  const stampInputRef = useRef<HTMLInputElement>(null)
  const backgroundInputRef = useRef<HTMLInputElement>(null)

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/certificates/templates')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data.templates || [])
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load templates', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Please select an image file', variant: 'destructive' })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Error', description: 'Image size should be less than 5MB', variant: 'destructive' })
      return
    }

    setUploadingField(field)
    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string
        const timestamp = Date.now()
        const filename = `certificate-templates/${timestamp}-${file.name}`

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: csrfHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ dataUrl, path: filename }),
        })

        if (!response.ok) throw new Error('Upload failed')
        const data = await response.json()

        setForm((prev) => ({ ...prev, [field]: data.url }))
        toast({ title: 'Success', description: 'Image uploaded successfully' })
      }
      reader.readAsDataURL(file)
    } catch {
      toast({ title: 'Error', description: 'Failed to upload image', variant: 'destructive' })
    } finally {
      setUploadingField(null)
      const inputRef = field === 'logoUrl' ? logoInputRef : field === 'signatureUrl' ? signatureInputRef : field === 'stampUrl' ? stampInputRef : backgroundInputRef
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const updateBlock = (id: string, field: keyof CertificateTextBlock, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      textBlocks: prev.textBlocks.map((b) => (b.id === id ? { ...b, [field]: value } : b)),
    }))
  }

  const addBlock = () => {
    setForm((prev) => ({ ...prev, textBlocks: [...prev.textBlocks, emptyBlock()] }))
  }

  const removeBlock = (id: string) => {
    setForm((prev) => ({
      ...prev,
      textBlocks: prev.textBlocks.filter((b) => b.id !== id),
    }))
  }

  const updateHeaderFont = (fontKey: 'titleFont' | 'subtitleFont', field: keyof CertificateHeaderFont, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      [fontKey]: { ...prev[fontKey], [field]: value },
    }))
  }

  const handleEdit = (template: CertificateTemplateDoc) => {
    setEditing(template)
    setForm({
      name: template.name || '',
      accountType: template.accountType || 'life',
      category: template.category || 'membership',
      title: template.title || '',
      subtitle: template.subtitle || '',
      titleFont: template.titleFont || defaultTitleFont,
      subtitleFont: template.subtitleFont || defaultSubtitleFont,
      textBlocks: template.textBlocks?.length ? template.textBlocks : [emptyBlock()],
      footerText: template.footerText || '',
      logoUrl: template.logoUrl || '',
      signatureUrl: template.signatureUrl || '',
      stampUrl: template.stampUrl || '',
      backgroundUrl: template.backgroundUrl || '',
      borderColor: template.borderColor || '#0d9488',
      accentColor: template.accentColor || '#b45309',
      fontFamily: template.fontFamily || 'serif',
      isActive: template.isActive !== false,
      isDefault: template.isDefault || false,
    })
    setShowForm(true)
  }

  const handleNew = () => {
    setEditing(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.textBlocks.length) {
      toast({ title: 'Error', description: 'At least one text block is required', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      const payload = sanitizeFormData(form as unknown as Record<string, unknown>)
      const url = editing ? `/api/certificates/templates/${editing.id}` : '/api/certificates/templates'
      const method = editing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: csrfHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to save template')
      }

      toast({
        title: editing ? 'Template updated' : 'Template created',
        description: 'The certificate template has been saved.',
      })
      setShowForm(false)
      setEditing(null)
      fetchTemplates()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to save template', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return
    try {
      const res = await fetch(`/api/certificates/templates/${id}`, {
        method: 'DELETE',
        headers: csrfHeaders(),
      })
      if (res.ok) {
        toast({ title: 'Template deleted', description: 'The template has been removed.' })
        fetchTemplates()
      } else {
        toast({ title: 'Error', description: 'Failed to delete template', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
  }

  const previewTemplate: CertificateTemplateDoc | null = showForm
    ? {
        name: form.name || 'Preview',
        accountType: (form.accountType as CertificateTemplateDoc['accountType']) || 'all',
        category: (form.category as CertificateTemplateDoc['category']) || 'membership',
        title: form.title,
        subtitle: form.subtitle,
        titleFont: form.titleFont,
        subtitleFont: form.subtitleFont,
        textBlocks: form.textBlocks,
        footerText: form.footerText,
        logoUrl: form.logoUrl || null,
        signatureUrl: form.signatureUrl || null,
        stampUrl: form.stampUrl || null,
        backgroundUrl: form.backgroundUrl || null,
        borderColor: form.borderColor,
        accentColor: form.accentColor,
        fontFamily: (form.fontFamily as CertificateTemplateDoc['fontFamily']) || 'serif',
        isActive: form.isActive,
        isDefault: form.isDefault,
      }
    : null

  const placeholderHints = [
    '{name} - member full name',
    '{membershipType} - Life/Annual/Student Member',
    '{memberId} - member ID',
    '{date} - issue date',
    '{qualification} - member qualification',
    '{rciNumber} - member RCI number (members only)',
    '{certificateNumber} - certificate number',
    '{webinarTitle} - webinar title (webinar certificates)',
    '{webinarSpeaker} - webinar speaker (webinar certificates)',
    '{webinarDate} - webinar date (webinar certificates)',
    '{duration} - webinar duration (webinar certificates)',
  ]

  const renderHeaderFontControls = (fontKey: 'titleFont' | 'subtitleFont', label: string) => {
    const font = form[fontKey]
    return (
      <div className="border rounded-lg p-3 space-y-3">
        <p className="text-sm font-medium text-upisha-navy dark:text-white">{label} Font</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">Font Size</Label>
            <Input
              type="number"
              min={8}
              max={96}
              value={font.fontSize}
              onChange={(e) => updateHeaderFont(fontKey, 'fontSize', Number(e.target.value))}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Weight</Label>
            <Select
              value={font.fontWeight}
              onValueChange={(v) => updateHeaderFont(fontKey, 'fontWeight', v as CertificateHeaderFont['fontWeight'])}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="semibold">Semibold</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Style</Label>
            <Select
              value={font.fontStyle}
              onValueChange={(v) => updateHeaderFont(fontKey, 'fontStyle', v as CertificateHeaderFont['fontStyle'])}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="italic">Italic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Align</Label>
            <Select
              value={font.textAlign}
              onValueChange={(v) => updateHeaderFont(fontKey, 'textAlign', v as CertificateHeaderFont['textAlign'])}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Color</Label>
            <Input
              type="color"
              value={font.color}
              onChange={(e) => updateHeaderFont(fontKey, 'color', e.target.value)}
              className="mt-1 h-9 p-1"
            />
          </div>
          <div>
            <Label className="text-xs">Letter Spacing</Label>
            <Input
              type="number"
              step="0.01"
              min={0}
              max={10}
              value={font.letterSpacing}
              onChange={(e) => updateHeaderFont(fontKey, 'letterSpacing', Number(e.target.value))}
              className="mt-1"
            />
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-upisha-teal" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-upisha-navy dark:text-white">Certificate Templates</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create and manage certificate designs
          </p>
        </div>
        <Button onClick={handleNew} className="bg-upisha-teal hover:bg-upisha-teal-dark text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {showForm ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-upisha-navy dark:text-white">
                {editing ? 'Edit Template' : 'Create Template'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <Label>Template Name *</Label>
                    <Input
                      required
                      placeholder="e.g. Life Member Certificate"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Account Type *</Label>
                    <Select value={form.accountType} onValueChange={(v) => setForm({ ...form, accountType: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="life">Life Member</SelectItem>
                        <SelectItem value="annual">Annual Member</SelectItem>
                        <SelectItem value="student">Student Member</SelectItem>
                        <SelectItem value="all">All Types</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Category *</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="membership">Membership</SelectItem>
                        <SelectItem value="webinar">Webinar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Title *</Label>
                  <Input
                    required
                    placeholder="e.g. Certificate of Life Membership"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Subtitle</Label>
                  <Input
                    placeholder="e.g. UP ISHA — Uttar Pradesh Indian Speech & Hearing Association"
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                    className="mt-1"
                  />
                </div>

                {/* Title & Subtitle Font Controls */}
                {renderHeaderFontControls('titleFont', 'Title')}
                {renderHeaderFontControls('subtitleFont', 'Subtitle')}

                {/* Text Blocks */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Text Blocks</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addBlock}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Block
                    </Button>
                  </div>

                  <div className="space-y-3 mb-2">
                    <p className="text-xs text-gray-500">Available placeholders:</p>
                    <div className="flex flex-wrap gap-2">
                      {placeholderHints.map((hint) => (
                        <span key={hint} className="text-[10px] bg-gray-100 dark:bg-gray-800 rounded px-2 py-0.5 font-mono">
                          {hint}
                        </span>
                      ))}
                    </div>
                  </div>

                  {form.textBlocks.map((block, idx) => (
                    <div key={block.id} className="border rounded-lg p-3 space-y-3 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Block {idx + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500"
                          onClick={() => removeBlock(block.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div>
                        <Label className="text-xs">Content *</Label>
                        <Textarea
                          required
                          rows={2}
                          placeholder="e.g. This is to certify that {name}..."
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <Label className="text-xs">Font Size</Label>
                          <Input
                            type="number"
                            min={8}
                            max={96}
                            value={block.fontSize}
                            onChange={(e) => updateBlock(block.id, 'fontSize', Number(e.target.value))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Weight</Label>
                          <Select
                            value={block.fontWeight}
                            onValueChange={(v) => updateBlock(block.id, 'fontWeight', v as CertificateTextBlock['fontWeight'])}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="semibold">Semibold</SelectItem>
                              <SelectItem value="bold">Bold</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Style</Label>
                          <Select
                            value={block.fontStyle}
                            onValueChange={(v) => updateBlock(block.id, 'fontStyle', v as CertificateTextBlock['fontStyle'])}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="italic">Italic</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Align</Label>
                          <Select
                            value={block.textAlign}
                            onValueChange={(v) => updateBlock(block.id, 'textAlign', v as CertificateTextBlock['textAlign'])}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs">Color</Label>
                          <Input
                            type="color"
                            value={block.color}
                            onChange={(e) => updateBlock(block.id, 'color', e.target.value)}
                            className="mt-1 h-9 p-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Margin Top</Label>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={block.marginTop}
                            onChange={(e) => updateBlock(block.id, 'marginTop', Number(e.target.value))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Margin Bottom</Label>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={block.marginBottom}
                            onChange={(e) => updateBlock(block.id, 'marginBottom', Number(e.target.value))}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <Label>Footer Text</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Signature labels are fixed on issued certificates (President on the left,
                    Secretary on the right). This text is kept for reference only.
                  </p>
                  <Input
                    placeholder="e.g. Secretary, UP ISHA"
                    value={form.footerText}
                    onChange={(e) => setForm({ ...form, footerText: e.target.value })}
                    className="mt-1"
                  />
                </div>

                {/* Image Uploads */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Logo</Label>
                    <Input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUpload(e, 'logoUrl')}
                      className="mt-1"
                    />
                    {uploadingField === 'logoUrl' && <Loader2 className="h-3 w-3 animate-spin text-upisha-teal mt-1" />}
                    {form.logoUrl && (
                      <img src={form.logoUrl} alt="Logo" className="h-10 w-10 object-contain mt-2" />
                    )}
                  </div>
                  <div>
                    <Label>Signature</Label>
                    <Input
                      ref={signatureInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUpload(e, 'signatureUrl')}
                      className="mt-1"
                    />
                    {uploadingField === 'signatureUrl' && <Loader2 className="h-3 w-3 animate-spin text-upisha-teal mt-1" />}
                    {form.signatureUrl && (
                      <img src={form.signatureUrl} alt="Signature" className="h-8 w-20 object-contain mt-2" />
                    )}
                  </div>
                  <div>
                    {/* This field is rendered as the President's signature
                        block (left footer slot) on issued certificates. */}
                    <Label>President&apos;s Signature</Label>
                    <Input
                      ref={stampInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUpload(e, 'stampUrl')}
                      className="mt-1"
                    />
                    {uploadingField === 'stampUrl' && <Loader2 className="h-3 w-3 animate-spin text-upisha-teal mt-1" />}
                    {form.stampUrl && (
                      <img src={form.stampUrl} alt="President Signature" className="h-10 w-10 object-contain mt-2" />
                    )}
                  </div>
                  <div>
                    <Label>Background</Label>
                    <Input
                      ref={backgroundInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUpload(e, 'backgroundUrl')}
                      className="mt-1"
                    />
                    {uploadingField === 'backgroundUrl' && <Loader2 className="h-3 w-3 animate-spin text-upisha-teal mt-1" />}
                  </div>
                </div>

                {/* Colors and Font */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Border Color</Label>
                    <Input
                      type="color"
                      value={form.borderColor}
                      onChange={(e) => setForm({ ...form, borderColor: e.target.value })}
                      className="mt-1 h-9 p-1"
                    />
                  </div>
                  <div>
                    <Label>Accent Color</Label>
                    <Input
                      type="color"
                      value={form.accentColor}
                      onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                      className="mt-1 h-9 p-1"
                    />
                  </div>
                  <div>
                    <Label>Font Family</Label>
                    <Select value={form.fontFamily} onValueChange={(v) => setForm({ ...form, fontFamily: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="serif">Serif</SelectItem>
                        <SelectItem value="sans-serif">Sans-serif</SelectItem>
                        <SelectItem value="cursive">Cursive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label>Active</Label>
                    <p className="text-xs text-gray-500">Show this template in the UI</p>
                  </div>
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="bg-upisha-teal hover:bg-upisha-teal-dark text-white"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      editing ? 'Update Template' : 'Create Template'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditing(null)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Right: Live Preview */}
          <div>
            <h2 className="text-lg font-semibold text-upisha-navy dark:text-white mb-3">Live Preview</h2>
            <div className="sticky top-4">
              <CertificatePreview
                template={previewTemplate}
                memberName="Dr. Sample Member"
                membershipType={form.accountType === 'life' ? 'life' : form.accountType === 'annual' ? 'annual' : form.accountType === 'student' ? 'student' : 'life'}
                memberId="a1b2c3d4e5"
                date={new Date().toISOString()}
                qualification="M.Sc. Audiology & Speech-Language Pathology"
                verificationUrl={`${window.location.origin}/verify/sample`}
              />
              <p className="text-xs text-gray-500 mt-3">
                This preview updates in real-time as you edit the form.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500">No templates created yet.</p>
                <p className="text-sm text-gray-400 mt-1">Click "New Template" to create one.</p>
              </CardContent>
            </Card>
          ) : (
            templates.map((template) => (
              <Card key={template.id} className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-upisha-navy dark:text-white">
                        {template.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{template.accountType}</Badge>
                        <Badge variant="outline" className={(template.category || 'membership') === 'webinar' ? 'border-upisha-teal text-upisha-teal' : ''}>
                          {(template.category || 'membership') === 'webinar' ? 'Webinar' : 'Membership'}
                        </Badge>
                        {template.isDefault && (
                          <Badge className="bg-upisha-gold text-white border-0">Default</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(template)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => template.id && handleDelete(template.id)}
                        className="h-8 w-8 text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[1.414/1] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative">
                    <div
                      className="absolute inset-2 rounded"
                      style={{
                        border: `4px solid ${template.borderColor}`,
                      }}
                    >
                      <div className="flex flex-col items-center justify-center h-full px-6 py-4 text-center">
                        <p className="text-sm font-bold" style={{ color: template.accentColor }}>
                          {template.title}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1">
                          {template.textBlocks?.length || 0} text blocks
                        </p>
                        <div className="flex gap-2 mt-2">
                          {template.logoUrl && (
                            <img src={template.logoUrl} alt="" className="h-6 w-6 object-contain" />
                          )}
                          {template.signatureUrl && (
                            <img src={template.signatureUrl} alt="" className="h-4 w-10 object-contain" />
                          )}
                          {template.stampUrl && (
                            <img src={template.stampUrl} alt="" className="h-6 w-6 object-contain" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-gray-500">
                      {template.isActive ? 'Active' : 'Inactive'}
                    </p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: template.fontFamily }}>
                      {template.fontFamily}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}