'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Plus, Edit, Trash2, Loader2, Image as ImageIcon, Upload } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { csrfHeaders } from '@/lib/csrf'

interface GalleryImage {
  id?: string
  src: string
  title: string
  category: string
  isActive?: boolean
}

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null)
  const [formData, setFormData] = useState({
    src: '',
    title: '',
    category: 'Events',
    isActive: true,
  })
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const categories = ['Events', 'Workshops', 'Meetings', 'Outreach', 'Training', 'Conferences']

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
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

    setUploading(true)
    setUploadProgress(0)

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const dataUrl = event.target?.result as string
        const timestamp = Date.now()
        const filename = `gallery/${timestamp}-${file.name}`
        
        setUploadProgress(50)
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          // /api/upload enforces CSRF double-submit — the x-csrf-token header
          // must match the csrf-token cookie, otherwise the request 403s.
          headers: csrfHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ dataUrl, path: filename }),
        })

        if (!response.ok) {
          const err = await response.json().catch(() => null)
          throw new Error(err?.error || `Upload failed (${response.status})`)
        }

        const data = await response.json()
        setUploadProgress(100)
        
        setFormData({ ...formData, src: data.url })
        toast({ title: 'Success', description: 'Image uploaded successfully' })
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to upload image', variant: 'destructive' })
      } finally {
        setUploading(false)
        setUploadProgress(0)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }
    reader.onerror = () => {
      toast({ title: 'Error', description: 'Failed to read file', variant: 'destructive' })
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    loadImages()
  }, [])

  async function loadImages() {
    try {
      const response = await fetch('/api/gallery')
      const data = await response.json()
      if (data.images) {
        setImages(data.images)
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load gallery images', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  function handleOpenDialog(image?: GalleryImage) {
    if (image) {
      setEditingImage(image)
      setFormData({
        src: image.src,
        title: image.title,
        category: image.category,
        isActive: image.isActive ?? true,
      })
    } else {
      setEditingImage(null)
      setFormData({ src: '', title: '', category: 'Events', isActive: true })
    }
    setDialogOpen(true)
  }

  function handleImageUrlChange(url: string) {
    setFormData({ ...formData, src: url })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const url = '/api/gallery'
      const method = editingImage ? 'PUT' : 'POST'
      const body = editingImage ? { ...formData, id: editingImage.id } : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) throw new Error('Failed to save gallery image')

      toast({ title: 'Success', description: `Gallery image ${editingImage ? 'updated' : 'created'} successfully` })
      setDialogOpen(false)
      loadImages()
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save gallery image', variant: 'destructive' })
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this gallery image?')) return
    try {
      const response = await fetch('/api/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!response.ok) throw new Error('Failed to delete gallery image')
      toast({ title: 'Success', description: 'Gallery image deleted successfully' })
      loadImages()
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete gallery image', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-upisha-teal" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-upisha-navy dark:text-white">Manage Gallery</h1>
        <Button onClick={() => handleOpenDialog()} className="bg-upisha-teal hover:bg-upisha-teal-dark">
          <Plus className="h-4 w-4 mr-2" />
          Add Image
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <Card key={image.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{image.title}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">{image.category}</p>
                </div>
                <div className="flex gap-2 ml-2">
                  <Button variant="outline" size="icon" onClick={() => handleOpenDialog(image)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => image.id && handleDelete(image.id)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-3">
                <img src={image.src} alt={image.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center justify-between">
                <Badge variant={image.isActive ? 'default' : 'secondary'}>
                  {image.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingImage ? 'Edit Gallery Image' : 'Add New Gallery Image'}</DialogTitle>
            <DialogDescription>Fill in the gallery image details below</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="imageUpload">Upload Image</Label>
              <div className="mt-2 flex items-center gap-4">
                <Input
                  ref={fileInputRef}
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
                {uploading && (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-500">{uploadProgress}%</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Supported formats: JPG, PNG, GIF (max 5MB)</p>
            </div>

            <div>
              <Label htmlFor="src">Image URL</Label>
              <Input 
                id="src" 
                value={formData.src} 
                onChange={(e) => handleImageUrlChange(e.target.value)} 
                placeholder="/images/photo.jpg or uploaded image URL" 
                required 
              />
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-upisha-teal"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-upisha-teal hover:bg-upisha-teal-dark">
                {editingImage ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}