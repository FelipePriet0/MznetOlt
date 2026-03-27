"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from '@/components/ui/sidebar'
import { BarChart3, Smartphone, Wifi, Shield, FileText, Settings, LogOut, BellDot } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const items = [
    { label: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { label: 'Não configuradas', href: '/onus/unconfigured', icon: Smartphone },
    { label: 'Configuradas', href: '/onus/configured', icon: Smartphone },
    { label: 'OLTs', href: '/olts', icon: Wifi },
    { label: 'Tickets', href: '/tickets', icon: BellDot },
    // Authorization removida do menu; agora inline na página de Não configuradas
    { label: 'Configurações', href: '/settings', icon: Settings },
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="space-y-1">
          <h1 className="text-base font-bold">SmartOLT</h1>
          <p className="text-[11px] text-[hsl(var(--sidebar-foreground))]/80">Network Management</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {items.map(it => {
              const Icon = it.icon
              const active = pathname === it.href || pathname.startsWith(it.href + '/')
              return (
                <SidebarMenuItem key={it.href}>
                  <SidebarMenuButton asChild isActive={active}>
                    <Link href={it.href}>
                      <Icon className="h-4 w-4" />
                      <span>{it.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))] text-xs font-bold">
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium truncate">{user?.name ?? 'User'}</p>
            <p className="text-[10px] opacity-80 truncate capitalize">{user?.role_code ?? ''}</p>
          </div>
          <button onClick={logout} className="ml-auto inline-flex items-center gap-1.5 text-xs hover:underline">
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
