'use client'

type CheckInStatus = 'not_started' | 'on_track' | 'completed'

interface CheckInStatusBadgeProps {
  status: CheckInStatus
}

const STATUS_CONFIG: Record<CheckInStatus, { label: string; bg: string; color: string; dot: string }> = {
  not_started: { label: 'Not Started', bg: '#f8fafc', color: '#64748b', dot: '#94a3b8' },
  on_track:    { label: 'On Track',    bg: '#fffbeb', color: '#92400e', dot: '#f59e0b' },
  completed:   { label: 'Completed',   bg: '#f0fdf9', color: '#0f4c3a', dot: '#0d9488' },
}

export default function CheckInStatusBadge({ status }: CheckInStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.not_started

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      background: config.bg, color: config.color,
      border: `1px solid ${config.dot}44`,
      borderRadius: '999px', padding: '4px 12px',
      fontSize: '12px', fontWeight: 600,
      fontFamily: 'Georgia, serif', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: config.dot, flexShrink: 0 }} />
      {config.label}
    </span>
  )
}