import { cn } from '@/lib/utils'

type OnuStatus = 'online' | 'offline' | 'unconfigured' | 'configured' | string

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  online:       { label: 'Online',       dot: 'bg-success',     bg: 'bg-success/10',     text: 'text-success'     },
  offline:      { label: 'Offline',      dot: 'bg-destructive', bg: 'bg-destructive/10', text: 'text-destructive' },
  unconfigured: { label: 'Unconfigured', dot: 'bg-warning',     bg: 'bg-warning/10',     text: 'text-warning'     },
  configured:   { label: 'Configured',   dot: 'bg-primary',     bg: 'bg-primary/10',     text: 'text-primary'     },
  warning:      { label: 'Warning',      dot: 'bg-warning',     bg: 'bg-warning/10',     text: 'text-warning'     },
  critical:     { label: 'Critical',     dot: 'bg-destructive', bg: 'bg-destructive/10', text: 'text-destructive' },
  running:      { label: 'Running',      dot: 'bg-success',     bg: 'bg-success/10',     text: 'text-success'     },
  failed:       { label: 'Failed',       dot: 'bg-destructive', bg: 'bg-destructive/10', text: 'text-destructive' },
  pending:      { label: 'Pending',      dot: 'bg-muted-foreground', bg: 'bg-muted',     text: 'text-muted-foreground' },
}

interface StatusBadgeProps {
  status: OnuStatus
  label?: string
  size?: 'sm' | 'md'
  pulse?: boolean
}

export function StatusBadge({ status, label, size = 'md', pulse = false }: StatusBadgeProps) {
  const key    = status.toLowerCase()
  const config = STATUS_CONFIG[key] ?? {
    label: status,
    dot:   'bg-muted-foreground',
    bg:    'bg-muted',
    text:  'text-muted-foreground',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        config.bg,
        config.text,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      )}
    >
      <span
        className={cn(
          'rounded-full shrink-0',
          config.dot,
          size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2',
          pulse && status === 'online' && 'animate-pulse'
        )}
      />
      {label ?? config.label}
    </span>
  )
}
