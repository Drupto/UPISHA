'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, Mail, Calendar, Megaphone, Bell, Menu, X, Monitor, LogOut, Star, Image, BookOpen } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/lib/hooks/useAuth'

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/members', label: 'Members', icon: Users },
  { href: '/admin/messages', label: 'Messages', icon: Mail },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/admin/webinars', label: 'Webinars', icon: Monitor },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/admin/testimonials', label: 'Testimonials', icon: Star },
  { href: '/admin/gallery', label: 'Gallery', icon: Image },
  { href: '/admin/publications', label: 'Publications', icon: BookOpen },
  { href: '/admin/newsletter', label: 'Newsletter', icon: Bell },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b">
        <Link href="/admin" className="font-bold text-upisha-teal text-lg">UP ISHA Admin</Link>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex">
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-64 shrink-0 bg-white dark:bg-gray-900 border-r min-h-screen`}>
          <div className="p-6 border-b hidden lg:block">
            <Link href="/admin" className="font-bold text-upisha-teal text-xl">UP ISHA Admin</Link>
            <p className="text-xs text-gray-500 mt-1">Management Panel</p>
          </div>
          <nav className="p-4 space-y-1">
            {adminLinks.map((link) => {
              const isActive = pathname === link.href
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-upisha-teal/10 text-upisha-teal'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t mt-4 space-y-2">
            <Link href="/" className="text-xs text-gray-500 hover:text-upisha-teal flex items-center gap-1">
              ← Back to Website
            </Link>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 text-sm font-medium"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

      <main className="flex-1 p-4 md:p-8 overflow-auto">
          <ProtectedRoute>
            {children}
          </ProtectedRoute>
        </main>
      </div>
    </div>
  )
}