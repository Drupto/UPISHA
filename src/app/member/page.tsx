'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, User, Mail, Phone, MapPin, Award, Calendar, CreditCard, FileText, Pencil, Save, X, Upload, Camera, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
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
  const { toast } = useToast()
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [rciPreview, setRciPreview] = useState<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const rciInputRef = useRef<HTMLInputElement>(null)

  // Edit form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    qualification: '',
    rciNumber: '',
    city: '',
    address: '',
    photoUrl: '',
    rciCertificateUrl: '',
    registrationDate: '',
  })
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const formErrors: Record<string, string> = {}
  if (touched.fullName && formData.fullName.trim().length < 2) formErrors.fullName = 'Name must be at least 2 characters'
  if (touched.phone && !/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(formData.phone)) formErrors.phone = 'Please enter a valid phone number'
  if (touched.qualification && formData.qualification.trim().length < 2) formErrors.qualification = 'Qualification is required'
  if (touched.city && formData.city.trim().length < 2) formErrors.city = 'City is required'
  if (touched.address && formData.address.trim().length < 5) formErrors.address = 'Address must be at least 5 characters'

  const formValid: Record<string, boolean> = {
    fullName: formData.fullName.trim().length >= 2,
    phone: /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(formData.phone),
    qualification: formData.qualification.trim().length >= 2,
    city: formData.city.trim().length >= 2,
    address: formData.address.trim().length >= 5,
  }

  const fieldClass = (field: string) => {
    const isTouched = touched[field]
    const hasError = formErrors[field]
    const isValid = formValid[field]
    if (isTouched && hasError) return 'border-red-400 dark:border-red-500 focus-visible:border-red-500'
    if (isTouched && isValid) return 'border-green-400 dark:border-green-500 focus-visible:border-green-400'
    return 'input-focus-ring'
  }

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
        const member = data.member as MemberProfile
        setProfile(member)
        setFormData({
          fullName: member.fullName || '',
          phone: member.phone || '',
          qualification: member.qualification || '',
          rciNumber: member.rciNumber || '',
          city: member.city || '',
          address: member.address || '',
          photoUrl: member.photoUrl || '',
          rciCertificateUrl: member.rciCertificateUrl || '',
          registrationDate: member.registrationDate || '',
        })
        setPhotoPreview(member.photoUrl || null)
        setRciPreview(member.rciCertificateUrl || null)
      } catch {
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [user?.uid])

  const handleFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Photo must be less than 5MB',
        variant: 'destructive',
      })
      return
    }
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive',
      })
      return
    }
    const base64 = await handleFileToBase64(file)
    setPhotoPreview(base64)
    setFormData({ ...formData, photoUrl: base64 })
  }

  const handleRciChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'RCI certificate must be less than 10MB',
        variant: 'destructive',
      })
      return
    }
    const base64 = await handleFileToBase64(file)
    setRciPreview(base64)
    setFormData({ ...formData, rciCertificateUrl: base64 })
  }

  const startEditing = () => {
    if (!profile) return
    setFormData({
      fullName: profile.fullName || '',
      phone: profile.phone || '',
      qualification: profile.qualification || '',
      rciNumber: profile.rciNumber || '',
      city: profile.city || '',
      address: profile.address || '',
      photoUrl: profile.photoUrl || '',
      rciCertificateUrl: profile.rciCertificateUrl || '',
      registrationDate: profile.registrationDate || '',
    })
    setPhotoPreview(profile.photoUrl || null)
    setRciPreview(profile.rciCertificateUrl || null)
    setTouched({})
    setIsEditing(true)
  }

  const cancelEditing = () => {
    if (!profile) return
    setFormData({
      fullName: profile.fullName || '',
      phone: profile.phone || '',
      qualification: profile.qualification || '',
      rciNumber: profile.rciNumber || '',
      city: profile.city || '',
      address: profile.address || '',
      photoUrl: profile.photoUrl || '',
      rciCertificateUrl: profile.rciCertificateUrl || '',
      registrationDate: profile.registrationDate || '',
    })
    setPhotoPreview(profile.photoUrl || null)
    setRciPreview(profile.rciCertificateUrl || null)
    setTouched({})
    setIsEditing(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validate required fields
    const requiredFields = ['fullName', 'phone', 'qualification', 'city', 'address']
    const newTouched: Record<string, boolean> = {}
    requiredFields.forEach((f) => (newTouched[f] = true))
    setTouched(newTouched)

    const hasErrors = requiredFields.some((f) => {
      if (f === 'address') return formData.address.trim().length < 5
      if (f === 'phone') return !/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(formData.phone)
      return formData[f as keyof typeof formData].trim().length < 2
    })

    if (hasErrors) {
      toast({
        title: 'Please fix the errors',
        description: 'Some required fields are invalid.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      const payload: Record<string, unknown> = {
        fullName: formData.fullName,
        phone: formData.phone,
        qualification: formData.qualification,
        rciNumber: formData.rciNumber || null,
        city: formData.city,
        address: formData.address,
        registrationDate: formData.registrationDate || null,
      }
      // Only send photo/cert if changed (i.e. it's a data URL)
      if (formData.photoUrl && formData.photoUrl.startsWith('data:')) {
        payload.photoUrl = formData.photoUrl
      }
      if (formData.rciCertificateUrl && formData.rciCertificateUrl.startsWith('data:')) {
        payload.rciCertificateUrl = formData.rciCertificateUrl
      }

      const res = await fetch('/api/members/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        // Refetch the updated profile
        const profileRes = await fetch('/api/members/me')
        if (profileRes.ok) {
          const data = await profileRes.json()
          const updated = data.member as MemberProfile
          setProfile(updated)
          setFormData({
            fullName: updated.fullName || '',
            phone: updated.phone || '',
            qualification: updated.qualification || '',
            rciNumber: updated.rciNumber || '',
            city: updated.city || '',
            address: updated.address || '',
            photoUrl: updated.photoUrl || '',
            rciCertificateUrl: updated.rciCertificateUrl || '',
            registrationDate: updated.registrationDate || '',
          })
          setPhotoPreview(updated.photoUrl || null)
          setRciPreview(updated.rciCertificateUrl || null)
        }
        setIsEditing(false)
        toast({
          title: 'Profile updated!',
          description: 'Your profile has been saved successfully.',
        })
      } else {
        const errData = await res.json().catch(() => ({}))
        toast({
          title: 'Update failed',
          description: errData.error || 'Please try again.',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Network error',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

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
        <div className="flex items-center gap-2">
          <Badge className={statusColors[profile.status || 'pending'] || 'bg-gray-100 text-gray-800'}>
            {profile.status ? profile.status.charAt(0).toUpperCase() + profile.status.slice(1) : 'Pending'}
          </Badge>
          {!isEditing && (
            <Button
              size="sm"
              variant="outline"
              onClick={startEditing}
              className="text-upisha-teal border-upisha-teal/30 hover:bg-upisha-teal/10"
            >
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-upisha-navy dark:text-white">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              {photoPreview ? (
                <img
                  src={photoPreview}
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
            {isEditing && (
              <div className="flex justify-center">
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => photoInputRef.current?.click()}
                  className="text-xs"
                >
                  <Camera className="h-3.5 w-3.5 mr-1.5" />
                  {photoPreview && photoPreview.startsWith('data:') ? 'Change Photo' : 'Upload Photo'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="lg:col-span-2 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-upisha-navy dark:text-white flex items-center justify-between">
              <span>Membership Details</span>
              {isEditing && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={cancelEditing}
                    disabled={isSaving}
                    className="text-gray-600 dark:text-gray-300"
                  >
                    <X className="h-3.5 w-3.5 mr-1.5" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    form="profile-form"
                    size="sm"
                    className="bg-upisha-teal hover:bg-upisha-teal-dark text-white"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5 mr-1.5" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form id="profile-form" onSubmit={handleSave} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                      Full Name *
                    </label>
                    <div className="relative">
                      <Input
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
                        className={fieldClass('fullName')}
                      />
                      {touched.fullName && formValid.fullName && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                      {touched.fullName && formErrors.fullName && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />}
                    </div>
                    {touched.fullName && formErrors.fullName && <p className="text-xs text-red-500 mt-1">{formErrors.fullName}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                      Phone *
                    </label>
                    <div className="relative">
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                        className={fieldClass('phone')}
                      />
                      {touched.phone && formValid.phone && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                      {touched.phone && formErrors.phone && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />}
                    </div>
                    {touched.phone && formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                      Qualification *
                    </label>
                    <div className="relative">
                      <Input
                        value={formData.qualification}
                        onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                        onBlur={() => setTouched((prev) => ({ ...prev, qualification: true }))}
                        className={fieldClass('qualification')}
                      />
                      {touched.qualification && formValid.qualification && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                      {touched.qualification && formErrors.qualification && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />}
                    </div>
                    {touched.qualification && formErrors.qualification && <p className="text-xs text-red-500 mt-1">{formErrors.qualification}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                      RCI Number
                    </label>
                    <Input
                      value={formData.rciNumber}
                      onChange={(e) => setFormData({ ...formData, rciNumber: e.target.value })}
                      className="input-focus-ring"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                      City *
                    </label>
                    <div className="relative">
                      <Input
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        onBlur={() => setTouched((prev) => ({ ...prev, city: true }))}
                        className={fieldClass('city')}
                      />
                      {touched.city && formValid.city && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                      {touched.city && formErrors.city && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />}
                    </div>
                    {touched.city && formErrors.city && <p className="text-xs text-red-500 mt-1">{formErrors.city}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                      Registration Date
                    </label>
                    <Input
                      type="date"
                      value={formData.registrationDate}
                      onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                      className="input-focus-ring"
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Address *
                  </label>
                  <div className="relative">
                    <Textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      onBlur={() => setTouched((prev) => ({ ...prev, address: true }))}
                      rows={3}
                      className={fieldClass('address')}
                    />
                    {touched.address && formValid.address && <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />}
                    {touched.address && formErrors.address && <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />}
                  </div>
                  {touched.address && formErrors.address && <p className="text-xs text-red-500 mt-1">{formErrors.address}</p>}
                </div>

                {/* RCI Certificate Upload */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    RCI Certificate
                  </label>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-pointer hover:border-upisha-teal transition-colors shrink-0"
                      onClick={() => rciInputRef.current?.click()}
                    >
                      {rciPreview && rciPreview.startsWith('data:') ? (
                        <img src={rciPreview} alt="RCI Certificate" className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        ref={rciInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleRciChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => rciInputRef.current?.click()}
                        className="text-xs"
                      >
                        <Upload className="h-3.5 w-3.5 mr-1.5" />
                        {rciPreview && rciPreview.startsWith('data:') ? 'Change Certificate' : 'Upload Certificate'}
                      </Button>
                      <p className="text-[10px] text-gray-400 mt-1">Max 10MB. Image or PDF.</p>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <>
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
              </>
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