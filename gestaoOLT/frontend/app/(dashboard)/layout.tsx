import { Sidebar } from '@/components/layout/sidebar'
import { AuthGuard } from '@/components/layout/auth-guard'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-[hsl(var(--sidebar-background))]">
        <Sidebar />
        <div className="flex-1 overflow-auto p-3">
          <main className="min-h-full w-full bg-[hsl(var(--card))] rounded-tl-[15px] rounded-tr-[15px] mt-[1.5px] shadow">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
