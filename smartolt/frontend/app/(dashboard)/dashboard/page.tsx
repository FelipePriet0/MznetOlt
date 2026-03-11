export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to SmartOLT Network Management System
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">OLTs</div>
          <div className="text-2xl font-bold mt-2">-</div>
          <p className="text-xs text-muted-foreground mt-2">Coming soon</p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">ONUs</div>
          <div className="text-2xl font-bold mt-2">-</div>
          <p className="text-xs text-muted-foreground mt-2">Coming soon</p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">
            Active Alarms
          </div>
          <div className="text-2xl font-bold mt-2">-</div>
          <p className="text-xs text-muted-foreground mt-2">Coming soon</p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">
            System Health
          </div>
          <div className="text-2xl font-bold mt-2">-</div>
          <p className="text-xs text-muted-foreground mt-2">Coming soon</p>
        </div>
      </div>

      <div className="mt-8 rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Activity log coming soon. System is under development.
        </p>
      </div>
    </div>
  )
}
