'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  Wifi,
  Smartphone,
  Shield,
  Settings,
  FileText,
  Menu,
  X,
  LogOut,
  BellDot,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    label: 'Não configuradas',
    href: '/onus/unconfigured',
    icon: <Smartphone className="w-5 h-5" />,
  },
  {
    label: 'Configuradas',
    href: '/onus/configured',
    icon: <Smartphone className="w-5 h-5" />,
  },
  {
    label: 'OLTs',
    href: '/olts',
    icon: <Wifi className="w-5 h-5" />,
  },
  {
    label: 'Tickets',
    href: '/tickets',
    icon: <BellDot className="w-5 h-5" />,
  },
  {
    // Authorization removida do menu; agora inline na página de Não configuradas
    label: 'Zones',
    href: '/settings',
    icon: <Settings className="w-5 h-5" />,
  },
]

export function Sidebar() {
  const pathname  = usePathname()
  const router    = useRouter()
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(true)

  function handleLogout() {
    logout()
    router.replace('/login')
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg border bg-card"
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'w-64' : 'w-0'
        } md:w-64 transition-all duration-300 overflow-hidden md:overflow-visible bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]`}
      >
        <div className="h-screen flex flex-col">
          {/* Logo/Header */}
          <div className="p-6">
            <h1 className="text-xl font-bold tracking-tight">SmartOLT</h1>
            <p className="text-xs text-white mt-1">
              Network Management
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-auto p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const baseHref = item.href.split('?')[0]
                const isActive = pathname === baseHref || pathname.startsWith(baseHref + '/')
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-2 rounded-lg
                        transition-colors duration-200
                        ${
                          isActive
                            ? 'bg-black/40 text-white hover:bg-black/40'
                            : 'text-white/90 hover:bg-black/40'
                        }
                      `}
                    >
                      {item.icon}
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 space-y-3">
            {/* User info */}
            {user && (
              <div className="flex items-center gap-2.5 px-1">
                {(() => {
                  const letter = (user.name?.trim()?.[0] || user.email?.trim()?.[0] || user.role_code?.trim()?.[0] || 'U').toUpperCase()
                  const displayName = user.name?.trim() || user.email || user.role_code
                  return (
                    <div className="flex w-full items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-bold shrink-0">
                        {letter}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{displayName}</p>
                        <p className="text-[10px] text-white/80 truncate capitalize">{user.role_code}</p>
                      </div>
                      <button
                        aria-label="Sign out"
                        onClick={handleLogout}
                        className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10"
                        title="Sign out"
                      >
                        <LogOut className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  )
                })()}
              </div>
            )}

            {/* Version */}
            <div className="px-1 text-[10px] text-muted-foreground/60">
              SmartOLT v0.1.0 · Under Development
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
