'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

// Role-based access control using Firestore user records.
// A user must have role 'admin' to access the admin panel.
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, role, loading } = useAuth()
  const isAdmin = role === 'admin'

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (!loading && user && !isAdmin) {
      // Authenticated but not an admin — redirect home
      router.push('/')
    }
  }, [user, role, loading, isAdmin, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-upisha-teal" />
      </div>
    )
  }

  if (!user || !isAdmin) return null

  return <>{children}</>
}