'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { User } from 'firebase/auth'
import { onAuthChange, loginUser, registerUser, logoutUser, resetPassword, sendVerificationEmail, refreshAuthToken, auth as getAuth } from '@/lib/auth'
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
  /** Re-fetch the account from Firebase and re-establish the session with
   *  fresh claims; returns the current emailVerified state. */
  recheckEmailVerification: () => Promise<boolean>
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
          // Automatically verify the user to restore the session cookie.
          // FORCE-REFRESH the token: getIdToken() returns a cached token
          // (~1h) whose claims (email_verified, …) were frozen at mint
          // time — an email verified after login would keep reporting
          // "unverified" until the cache expires. getIdToken(true) does a
          // server round-trip for the latest claims, and it also resolves
          // the stale-vs-fresh cookie race between this session-restore
          // verify and the login page's verify.
          let token: string | null = null
          try {
            token = await refreshAuthToken()
          } catch {
            // fall through to the cached token below
          }
          if (!token) token = await user.getIdToken()
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

  /**
   * Re-fetch the account from Firebase Auth (reload) and re-establish the
   * session cookie with fresh claims. Used by the member dashboard's
   * "I've verified — recheck now" button so users don't need a full page
   * reload (which would still reuse the cached token).
   */
  const recheckEmailVerification = async (): Promise<boolean> => {
    try {
      const token = await refreshAuthToken()
      if (!token) return false
      await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
        cache: 'no-store',
      })
      const res = await fetch('/api/auth/me', { cache: 'no-store' })
      if (!res.ok) return false
      const data = await res.json()
      setRole(data.role ?? 'user')
      setMemberStatus(data.memberStatus ?? null)
      // reload() mutates the User object in place — clone it (keeping the
      // prototype) so React sees a new reference and claim-driven gates
      // (e.g. MemberRoute's emailVerified check) re-render with the
      // fresh value.
      const current = getAuth().currentUser
      if (current) {
        setUser(Object.assign(Object.create(Object.getPrototypeOf(current)), current) as User)
      }
      return data.emailVerified === true
    } catch {
      return false
    }
  }

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
        recheckEmailVerification,
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