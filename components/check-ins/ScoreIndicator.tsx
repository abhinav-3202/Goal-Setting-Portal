'use client'

interface ScoreIndicatorProps {
  score: number | null
  uom: string
}

export default function ScoreIndicator({ score, uom }: ScoreIndicatorProps) {
  if (score === null || score === undefined) {
    return (
      <span style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>—</span>
    )
  }

  const pct = Math.min(Math.round(score * 100), 100)

  const getColor = () => {
    if (pct >= 90) return { bg: '#f0fdf9', color: '#0d9488', border: '#99f6e4' }
    if (pct >= 70) return { bg: '#f0fdf9', color: '#059669', border: '#6ee7b7' }
    if (pct >= 50) return { bg: '#fffbeb', color: '#92400e', border: '#fde68a' }
    return { bg: '#fff1f2', color: '#be123c', border: '#fecdd3' }
  }

  const { bg, color, border } = getColor()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {/* Ring */}
      <div style={{ position: 'relative', width: '36px', height: '36px', flexShrink: 0 }}>
        <svg width="36" height="36" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="14"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${(pct / 100) * 87.96} 87.96`}
            strokeLinecap="round"
            transform="rotate(-90 18 18)"
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
        </svg>
        <span style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '9px', fontWeight: 800, color,
        }}>
          {uom === 'zero' ? (score === 1 ? '✓' : '✗') : `${pct}%`}
        </span>
      </div>

      {/* Label badge */}
      <span style={{
        background: bg, color, border: `1px solid ${border}`,
        borderRadius: '999px', padding: '3px 10px',
        fontSize: '12px', fontWeight: 600, fontFamily: 'Georgia, serif',
      }}>
        {uom === 'zero'
          ? score === 1 ? 'Success' : 'Not Met'
          : pct >= 90 ? 'Excellent'
          : pct >= 70 ? 'On Track'
          : pct >= 50 ? 'At Risk'
          : 'Below Target'}
      </span>
    </div>
  )
}