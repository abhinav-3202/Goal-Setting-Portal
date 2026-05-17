'use client'

interface WeightageBarProps {
  total: number
}

export default function WeightageBar({ total }: WeightageBarProps) {
  const isExact = total === 100
  const isOver = total > 100

  const barColor = isExact
    ? 'linear-gradient(135deg, #0d9488, #06b6d4)'
    : isOver
    ? 'linear-gradient(135deg, #e11d48, #fb7185)'
    : 'linear-gradient(135deg, #f59e0b, #fbbf24)'

  const textColor = isExact ? '#0f4c3a' : isOver ? '#be123c' : '#92400e'
  const bgColor = isExact ? '#f0fdf9' : isOver ? '#fff1f2' : '#fffbeb'
  const borderColor = isExact ? '#99f6e4' : isOver ? '#fecdd3' : '#fde68a'

  const message = isExact
    ? '✓ Weightage is balanced'
    : isOver
    ? `Over by ${total - 100}% — reduce weightage`
    : `${100 - total}% remaining to allocate`

  return (
    <div
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '14px',
        padding: '14px 18px',
        marginBottom: '8px',
        transition: 'all 0.3s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ color: textColor, fontWeight: 700, fontSize: '13px', fontFamily: 'Georgia, serif' }}>
          Total Weightage
        </span>
        <span style={{ color: textColor, fontWeight: 800, fontSize: '20px', fontFamily: 'Georgia, serif' }}>
          {total}%
        </span>
      </div>

      {/* Progress bar track */}
      <div
        style={{
          background: '#e2e8f0',
          borderRadius: '999px',
          height: '8px',
          overflow: 'hidden',
          marginBottom: '8px',
        }}
      >
        <div
          style={{
            background: barColor,
            height: '100%',
            width: `${Math.min(total, 100)}%`,
            borderRadius: '999px',
            transition: 'width 0.4s ease, background 0.3s ease',
          }}
        />
      </div>

      <p style={{ color: textColor, fontSize: '12px', fontWeight: 500, margin: 0 }}>
        {message}
      </p>
    </div>
  )
}