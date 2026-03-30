"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type SidebarContextValue = {
  open: boolean
  setOpen: (v: boolean) => void
  toggleSidebar: () => void
  isMobile: boolean
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

export function useSidebar(): SidebarContextValue {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) throw new Error("useSidebar must be used within <SidebarProvider>")
  return ctx
}

const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

export function SidebarProvider({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const [open, setOpen] = React.useState(true)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    onResize(); window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMeta = navigator.platform.includes('Mac') ? e.metaKey : e.ctrlKey
      if (isMeta && e.key.toLowerCase() === SIDEBAR_KEYBOARD_SHORTCUT) {
        e.preventDefault(); setOpen(v => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const value: SidebarContextValue = {
    open,
    setOpen,
    toggleSidebar: () => setOpen(v => !v),
    isMobile,
  }

  return (
    <SidebarContext.Provider value={value}>
      <div
        style={{
          // theming widths
          ["--sidebar-width" as any]: SIDEBAR_WIDTH,
          ["--sidebar-width-mobile" as any]: SIDEBAR_WIDTH_MOBILE,
          ...style,
        }}
        className="flex min-h-screen w-full"
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

export function Sidebar({
  children,
  side = 'left',
  variant = 'sidebar',
  collapsible = 'none',
}: {
  children: React.ReactNode
  side?: 'left' | 'right'
  variant?: 'sidebar' | 'floating' | 'inset'
  collapsible?: 'offcanvas' | 'icon' | 'none'
}) {
  const { open, isMobile } = useSidebar()
  const widthVar = isMobile ? 'var(--sidebar-width-mobile)' : 'var(--sidebar-width)'
  return (
    <aside
      data-variant={variant}
      data-collapsible={collapsible}
      data-open={open}
      className={cn(
        'relative shrink-0 border-r',
        'bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] border-[hsl(var(--sidebar-border))]',
        open ? 'w-[--sidebar-width]' : 'w-0 md:w-[3.25rem] md:data-[variant=floating]:w-0',
        side === 'right' && 'order-2 border-l border-r-0'
      )}
      style={{ width: open ? (widthVar as any) : undefined }}
    >
      <div className="flex h-screen flex-col">
        {children}
      </div>
    </aside>
  )
}

export function SidebarHeader({ children }: { children?: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-10 border-b border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-background))] px-4 py-3">
      {children}
    </div>
  )
}

export function SidebarFooter({ children }: { children?: React.ReactNode }) {
  return (
    <div className="mt-auto sticky bottom-0 border-t border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-background))] px-4 py-3">
      {children}
    </div>
  )
}

export function SidebarContent({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex-1 overflow-auto px-3 py-3">
      {children}
    </div>
  )
}

export function SidebarGroup({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <div className={cn('mb-3', className)}>{children}</div>
}

export function SidebarTrigger({ className }: { className?: string }) {
  const { toggleSidebar } = useSidebar()
  return (
    <button
      type="button"
      className={cn('m-2 inline-flex h-8 w-8 items-center justify-center rounded-md border bg-background text-foreground hover:bg-muted', className)}
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M4 6h16v2H4V6Zm0 5h10v2H4v-2Zm0 5h16v2H4v-2Z"/></svg>
    </button>
  )
}

// Simple menu primitives (subset)
export function SidebarMenu({ children }: { children?: React.ReactNode }) {
  return <ul className="space-y-1">{children}</ul>
}

export function SidebarMenuItem({ children }: { children?: React.ReactNode }) {
  return <li>{children}</li>
}

export function SidebarMenuButton({ children, asChild = false, isActive = false }: { children: React.ReactNode; asChild?: boolean; isActive?: boolean }) {
  const className = cn(
    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
    isActive ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]'
  )
  if (asChild) return <span className={className}>{children}</span>
  return <button className={className} type="button">{children}</button>
}

export function SidebarRail() {
  const { toggleSidebar } = useSidebar()
  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
      className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-2 rounded-l bg-[hsl(var(--sidebar-border))] hover:bg-[hsl(var(--sidebar-accent))]"
    />
  )
}

export function SidebarInset({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1">
      {children}
    </div>
  )
}
