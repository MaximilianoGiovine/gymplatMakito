'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Dumbbell, Utensils, BrainCircuit, LayoutDashboard, Settings, LogOut, ShieldCheck } from 'lucide-react'

// Simple type for UserRole
type UserRole = 'admin' | 'user'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  roles?: UserRole[] // If undefined, visible to all
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/workout', label: 'Workouts', icon: Dumbbell },
  { href: '/recipes', label: 'Nutrition', icon: Utensils },
  { href: '/coach', label: 'Makito', icon: BrainCircuit },
  { href: '/admin', label: 'Admin Panel', icon: ShieldCheck, roles: ['admin'] },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userRole, setUserRole] = useState<UserRole>('user')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUserRole() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role) {
          setUserRole(profile.role as UserRole)
        }
      }
      setLoading(false)
    }
    getUserRole()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true
    return item.roles.includes(userRole)
  })

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Dumbbell className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-xl text-foreground tracking-tight">Gymplat</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 bg-muted rounded-md animate-pulse" />
            ))}
          </div>
        ) : (
          filteredNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })
        )}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
