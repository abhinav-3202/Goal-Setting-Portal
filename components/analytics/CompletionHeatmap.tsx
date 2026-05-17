'use client'

interface HeatmapCell {
  department: string
  Q1?: number
  Q2?: number
  Q3?: number
  Q4?: number
}

interface CompletionHeatmapProps {
  data: HeatmapCell[]
}

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'] as const

function getCellStyle(value: number | undefined) {
  if (value === undefined || value === null) {
    return { bg: '#f8fafc', color: '#94a3b8', text: '—' }
  }
  const pct = Math.round(value * 100)
  if (pct >= 90) return { bg: '#0d9488', color: 'white', text: `${pct}%` }
  if (pct >= 70) return { bg: '#5eead4', color: '#0f4c3a', text: `${pct}%` }
  if (pct >= 50) return { bg: '#fde68a', color: '#92400e', text: `${pct}%` }
  if (pct >= 25) return { bg: '#fed7aa', color: '#9a3412', text: `${pct}%` }
  return { bg: '#fecdd3', color: '#be123c', text: `${pct}%` }
}

export default function CompletionHeatmap({ data }: CompletionHeatmapProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#4a7c6f', fontSize: '13px', fontFamily: 'Georgia, serif' }}>
        No heatmap data available for the selected filters.
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Georgia, serif' }}>
      {/* Colour scale legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <span style={{ color: '#4a7c6f', fontSize: '11px', marginRight: '4px' }}>Scale:</span>
        {[
          { bg: '#fecdd3', label: '0–24%' },
          { bg: '#fed7aa', label: '25–49%' },
          { bg: '#fde68a', label: '50–69%' },
          { bg: '#5eead4', label: '70–89%' },
          { bg: '#0d9488', label: '90–100%' },
        ].map((s) => (
          <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: s.bg, display: 'inline-block', border: '1px solid #e2e8f0' }} />
            <span style={{ fontSize: '10px', color: '#4a7c6f' }}>{s.label}</span>
          </span>
        ))}
      </div>

      {/* Grid */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '4px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '6px 10px', color: '#4a7c6f', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Department
              </th>
              {QUARTERS.map((q) => (
                <th key={q} style={{ textAlign: 'center', padding: '6px 10px', color: '#4a7c6f', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {q}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.department}>
                <td style={{ padding: '6px 10px', color: '#0f4c3a', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap' }}>
                  {row.department}
                </td>
                {QUARTERS.map((q) => {
                  const { bg, color, text } = getCellStyle(row[q])
                  return (
                    <td key={q} style={{ textAlign: 'center', padding: '2px' }}>
                      <div style={{
                        background: bg, color,
                        borderRadius: '10px', padding: '10px 8px',
                        fontWeight: 700, fontSize: '13px',
                        minWidth: '56px',
                        transition: 'transform 0.15s',
                        cursor: 'default',
                      }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.06)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                      >
                        {text}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}