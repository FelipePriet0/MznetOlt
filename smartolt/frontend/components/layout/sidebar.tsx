'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Wifi,
  Smartphone,
  Shield,
  Settings,
  FileText,
  Zap,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'

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
    label: 'ONUs',
    href: '/dashboard/onus',
    icon: <Smartphone className="w-5 h-5" />,
  },
  {
    label: 'OLTs',
    href: '/dashboard/olts',
    icon: <Wifi className="w-5 h-5" />,
  },
  {
    label: 'Authorization',
    href: '/dashboard/authorization',
    icon: <Shield className="w-5 h-5" />,
  },
  {
    label: 'Reports',
    href: '/dashboard/reports',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    label: 'Diagnostics',
    href: '/dashboard/diagnostics',
    icon: <Zap className="w-5 h-5" />,
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: <Settings className="w-5 h-5" />,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)

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
        } md:w-64 border-r bg-card transition-all duration-300 overflow-hidden md:overflow-visible`}
      >
        <div className="h-screen flex flex-col">
          {/* Logo/Header */}
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold tracking-tight">SmartOLT</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Network Management
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-auto p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
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
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-muted'
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
          <div className="p-4 border-t">
            <div className="text-xs text-muted-foreground">
              <p>SmartOLT v0.1.0</p>
              <p className="mt-1">Under Development</p>
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
