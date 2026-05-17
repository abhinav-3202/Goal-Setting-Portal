'use client'

type GoalStatus = 'draft' | 'submitted' | 'approved' | 'locked'

interface GoalStatusBadgeProps {
  status: GoalStatus
}

const STATUS_CONFIG: Record<GoalStatus, { label: string; bg: string; color: string; dot: string }> = {
  draft: {
    label: 'Draft',
    bg: '#f8fafc',
    color: '#64748b',
    dot: '#94a3b8',
  },
  submitted: {
    label: 'Pending Approval',
    bg: '#fffbeb',
    color: '#92400e',
    dot: '#f59e0b',
  },
  approved: {
    label: 'Approved',
    bg: '#f0fdf9',
    color: '#0f4c3a',
    dot: '#0d9488',
  },
  locked: {
    label: 'Locked',
    bg: '#eff6ff',
    color: '#1e40af',
    dot: '#3b82f6',
  },
}

export default function GoalStatusBadge({ status }: GoalStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.dot}33`,
        borderRadius: '999px',
        padding: '4px 12px',
        fontSize: '12px',
        fontWeight: 600,
        fontFamily: 'Georgia, serif',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: config.dot,
          flexShrink: 0,
        }}
      />
      {config.label}
    </span>
  )
}