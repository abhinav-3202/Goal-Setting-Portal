'use client'

type EscalationStatus = 'warning' | 'escalated' | 'resolved'

interface EscalationBadgeProps {
  status: EscalationStatus
}

const CONFIG: Record<EscalationStatus, { label: string; bg: string; color: string; dot: string }> = {
  warning:   { label: 'Warning',   bg: '#fffbeb', color: '#92400e', dot: '#f59e0b' },
  escalated: { label: 'Escalated', bg: '#fff1f2', color: '#be123c', dot: '#e11d48' },
  resolved:  { label: 'Resolved',  bg: '#f0fdf9', color: '#0f4c3a', dot: '#0d9488' },
}

export default function EscalationBadge({ status }: EscalationBadgeProps) {
  const cfg = CONFIG[status] ?? CONFIG.warning

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.dot}44`,
      borderRadius: '999px', padding: '4px 12px',
      fontSize: '12px', fontWeight: 600,
      fontFamily: 'Georgia, serif', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}