'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/hooks/useAuth'
import { Loader2, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token } = await login(email, password)
      const verifyRes = await fetch('/api/auth/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      // Determine role from the verify response and redirect accordingly
      const data = await verifyRes.json().catch(() => ({}))
      if (data.role === 'admin') {
        router.push('/admin')
      } else if (data.role === 'member') {
        if (data.emailVerified === false) {
          setError('Please verify your email address before accessing the member dashboard. Check your inbox for the verification link.')
        } else {
          router.push('/member')
        }
      } else {
        router.push('/')
      }
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string }
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password')
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.')
      } else {
        setError(error.message || 'Failed to login')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center mx-auto mb-4 bg-white border border-gray-200 shadow-md">
            <img
              src="/images/mainlogo.jpeg"
              alt="UP ISHA Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-upisha-navy dark:text-white">UP ISHA Admin</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to manage your association</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="admin@upisha.org" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
              </div>
              <Button type="submit" className="w-full bg-upisha-teal hover:bg-upisha-teal-dark text-white" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Signing in...</> : 'Sign In'}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <div>
                Not a member yet? <Link href="/apply" className="text-upisha-teal hover:underline font-medium">Join UP ISHA</Link>
              </div>
              <div>
                Admin? <Link href="/register" className="text-upisha-teal hover:underline">Create admin account</Link>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-upisha-teal">← Back to website</Link>
        </div>
      </div>
    </div>
  )
}