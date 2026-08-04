'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

/**
 * Route guard for the member panel.
 * Allows access for users with role 'member' or 'admin'.
 * Redirects unauthenticated users to /login and unknown roles to /.
 */
export default function MemberRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, role, loading } = useAuth()
  const isMember = role === 'member' || role === 'admin'

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (!loading && user && !isMember) {
      router.push('/')
    }
  }, [user, role, loading, isMember, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-upisha-teal" />
      </div>
    )
  }

  if (!user || !isMember) return null

  return <>{children}</>
}