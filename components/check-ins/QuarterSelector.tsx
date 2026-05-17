'use client'

type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4'

interface QuarterSelectorProps {
  active: Quarter
  activeQuarter: Quarter  // from cycle — only this one is editable
  onChange: (q: Quarter) => void
}

const QUARTER_LABELS: Record<Quarter, { label: string; period: string }> = {
  Q1: { label: 'Q1', period: 'Apr – Jun' },
  Q2: { label: 'Q2', period: 'Jul – Sep' },
  Q3: { label: 'Q3', period: 'Oct – Dec' },
  Q4: { label: 'Q4', period: 'Jan – Mar' },
}

const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4']

export default function QuarterSelector({ active, activeQuarter, onChange }: QuarterSelectorProps) {
  return (
    <div style={{
      display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px',
    }}>
      {QUARTERS.map((q) => {
        const isActive = q === active
        const isEditable = q === activeQuarter
        const { label, period } = QUARTER_LABELS[q]

        return (
          <button
            key={q}
            onClick={() => onChange(q)}
            style={{
              flex: 1, minWidth: '80px',
              padding: '10px 8px',
              borderRadius: '12px',
              border: isActive
                ? '2px solid #0d9488'
                : '1px solid #c9ebe4',
              background: isActive
                ? 'linear-gradient(135deg, #0d9488, #06b6d4)'
                : isEditable
                ? '#f0fdf9'
                : 'white',
              color: isActive ? 'white' : '#0f4c3a',
              cursor: 'pointer',
              fontFamily: 'Georgia, serif',
              transition: 'all 0.2s',
              position: 'relative',
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '15px' }}>{label}</div>
            <div style={{ fontSize: '11px', opacity: isActive ? 0.9 : 0.6, marginTop: '2px' }}>{period}</div>
            {isEditable && !isActive && (
              <span style={{
                position: 'absolute', top: '-6px', right: '-4px',
                background: '#0d9488', color: 'white',
                fontSize: '9px', fontWeight: 700,
                padding: '1px 5px', borderRadius: '999px',
              }}>
                OPEN
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}