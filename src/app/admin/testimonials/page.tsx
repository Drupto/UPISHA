'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Star, Plus, Edit, Trash2, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Testimonial {
  id?: string
  name: string
  role: string
  content: string
  rating: number
  isActive?: boolean
}

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    content: '',
    rating: 5,
    isActive: true,
  })
  const { toast } = useToast()

  useEffect(() => {
    loadTestimonials()
  }, [])

  async function loadTestimonials() {
    try {
      const response = await fetch('/api/testimonials')
      const data = await response.json()
      if (data.testimonials) {
        setTestimonials(data.testimonials)
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load testimonials', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  function handleOpenDialog(testimonial?: Testimonial) {
    if (testimonial) {
      setEditingTestimonial(testimonial)
      setFormData({
        name: testimonial.name,
        role: testimonial.role,
        content: testimonial.content,
        rating: testimonial.rating,
        isActive: testimonial.isActive ?? true,
      })
    } else {
      setEditingTestimonial(null)
      setFormData({ name: '', role: '', content: '', rating: 5, isActive: true })
    }
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const url = editingTestimonial ? '/api/testimonials' : '/api/testimonials'
      const method = editingTestimonial ? 'PUT' : 'POST'
      const body = editingTestimonial ? { ...formData, id: editingTestimonial.id } : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) throw new Error('Failed to save testimonial')

      toast({ title: 'Success', description: `Testimonial ${editingTestimonial ? 'updated' : 'created'} successfully` })
      setDialogOpen(false)
      loadTestimonials()
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save testimonial', variant: 'destructive' })
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this testimonial?')) return
    try {
      const response = await fetch('/api/testimonials', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!response.ok) throw new Error('Failed to delete testimonial')
      toast({ title: 'Success', description: 'Testimonial deleted successfully' })
      loadTestimonials()
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete testimonial', variant: 'destructive' })
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
        <h1 className="text-2xl font-bold text-upisha-navy dark:text-white">Manage Testimonials</h1>
        <Button onClick={() => handleOpenDialog()} className="bg-upisha-teal hover:bg-upisha-teal-dark">
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      <div className="grid gap-4">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">{testimonial.role}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleOpenDialog(testimonial)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => testimonial.id && handleDelete(testimonial.id)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 italic mb-3">&ldquo;{testimonial.content}&rdquo;</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < testimonial.rating ? 'fill-upisha-gold text-upisha-gold' : 'text-gray-300'}`} />
                  ))}
                </div>
                <Badge variant={testimonial.isActive ? 'default' : 'secondary'}>
                  {testimonial.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}</DialogTitle>
            <DialogDescription>Fill in the testimonial details below</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="role">Role / Position</Label>
              <Input id="role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="content">Testimonial Content</Label>
              <Textarea id="content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={4} required />
            </div>
            <div>
              <Label htmlFor="rating">Rating</Label>
              <Input id="rating" type="number" min="1" max="5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })} required />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-upisha-teal hover:bg-upisha-teal-dark">
                {editingTestimonial ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}