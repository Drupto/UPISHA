'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Calendar, Monitor, Megaphone, Menu, X, LogOut, Home, BookOpen, Award } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import MemberRoute from '@/components/auth/MemberRoute'
import { useAuth } from '@/lib/hooks/useAuth'

const memberLinks = [
  { href: '/member', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/member/events', label: 'Events', icon: Calendar },
  { href: '/member/webinars', label: 'Webinars', icon: Monitor },
  { href: '/member/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/member/publications', label: 'Publications', icon: BookOpen },
  { href: '/member/certificates', label: 'Certificates', icon: Award },
]

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { logout, user } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b">
        <Link href="/member" className="font-bold text-upisha-teal text-lg">UP ISHA Member</Link>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex">
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-64 shrink-0 bg-white dark:bg-gray-900 border-r min-h-screen`}>
          <div className="p-6 border-b hidden lg:block">
            <Link href="/member" className="font-bold text-upisha-teal text-xl">UP ISHA Member</Link>
            <p className="text-xs text-gray-500 mt-1">Member Portal</p>
          </div>
          <nav className="p-4 space-y-1">
            {memberLinks.map((link) => {
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
            {user?.email && (
              <p className="text-xs text-gray-500 truncate">Signed in as {user.email}</p>
            )}
            <Link href="/" className="text-xs text-gray-500 hover:text-upisha-teal flex items-center gap-1">
              <Home className="h-3 w-3" />
              Back to Website
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
          <MemberRoute>
            {children}
          </MemberRoute>
        </main>
      </div>
    </div>
  )
}