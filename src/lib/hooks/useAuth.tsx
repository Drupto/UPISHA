'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { User } from 'firebase/auth'
import { onAuthChange, loginUser, registerUser, logoutUser, resetPassword, sendVerificationEmail } from '@/lib/auth'
import type { UserRole } from '@/lib/firestore'

interface AuthContextType {
  user: User | null
  role: UserRole | null
  memberStatus: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ user: User; token: string }>
  register: (email: string, password: string, displayName: string) => Promise<{ user: User; token: string }>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  sendVerificationEmail: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [memberStatus, setMemberStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    let cancelled = false
    try {
      unsubscribe = onAuthChange(async (user) => {
        setUser(user)
        if (user) {
          // Automatically verify the user to restore the session cookie
          // This ensures users remain signed in after browser refresh
          const token = await user.getIdToken()
          try {
            await fetch('/api/auth/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token }),
              // Use no-cache to ensure we get the latest session state
              cache: 'no-store',
            })
          } catch {
            // If verification fails, continue with retries for role fetch
          }

          // The session cookie is set by /api/auth/verify AFTER the auth state
          // change fires, so retry fetching the role until the cookie is available.
          // Keep `loading` true until the role is resolved so route guards
          // don't redirect to the landing page during a hard refresh.
          let attempts = 0
          const maxAttempts = 5
          const fetchRole = async (): Promise<void> => {
            try {
              const res = await fetch('/api/auth/me')
              if (res.ok) {
                const data = await res.json()
                if (!cancelled) {
                  setRole(data.role ?? 'user')
                  setMemberStatus(data.memberStatus ?? null)
                }
                return
              }
            } catch {
              // fall through to retry
            }
            attempts++
            if (attempts < maxAttempts) {
              await new Promise((resolve) => setTimeout(resolve, 500))
              await fetchRole()
            } else if (!cancelled) {
              setRole(null)
              setMemberStatus(null)
            }
          }
          await fetchRole()
        } else {
          setRole(null)
          setMemberStatus(null)
        }
        if (!cancelled) setLoading(false)
      })
    } catch {
      // Firebase env vars may not be configured (e.g. during build or
      // on Netlify if NEXT_PUBLIC_FIREBASE_* are not set). Gracefully
      // set loading=false so the page renders without auth.
      setLoading(false)
    }
    return () => {
      cancelled = true
      if (unsubscribe) unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        memberStatus,
        loading,
        login: loginUser,
        register: registerUser,
        logout: logoutUser,
        resetPassword: resetPassword,
        sendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}