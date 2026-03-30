"use client"

export function InfoRow({ label, value, onClick }: { label: string; value: React.ReactNode; onClick?: () => void }) {
  return (
    <div className="flex items-center justify-center gap-3 py-1">
      <span className="text-xs text-muted-foreground min-w-[200px] text-center">{label}</span>
      {onClick ? (
        <button className="text-sm font-medium underline-offset-2 hover:underline text-center" onClick={onClick}>
          {value ?? '—'}
        </button>
      ) : (
        <span className="text-sm font-medium text-center">{value ?? '—'}</span>
      )}
    </div>
  )
}

