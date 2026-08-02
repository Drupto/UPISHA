'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { User } from 'firebase/auth'
import { onAuthChange, loginUser, registerUser, logoutUser, resetPassword } from '@/lib/auth'
import type { UserRole } from '@/lib/firestore'

interface AuthContextType {
  user: User | null
  role: UserRole | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ user: User; token: string }>
  register: (email: string, password: string, displayName: string) => Promise<{ user: User; token: string }>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setUser(user)
      if (user) {
        // The session cookie is set by /api/auth/verify AFTER the auth state
        // change fires, so retry fetching the role until the cookie is available.
        let attempts = 0
        const maxAttempts = 5
        const fetchRole = async (): Promise<void> => {
          try {
            const res = await fetch('/api/auth/me')
            if (res.ok) {
              const data = await res.json()
              setRole(data.role ?? 'user')
              return
            }
          } catch {
            // fall through to retry
          }
          attempts++
          if (attempts < maxAttempts) {
            setTimeout(fetchRole, 500)
          } else {
            setRole(null)
          }
        }
        fetchRole()
      } else {
        setRole(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        login: loginUser,
        register: registerUser,
        logout: logoutUser,
        resetPassword: resetPassword,
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
