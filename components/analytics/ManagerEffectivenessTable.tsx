'use client'
import { Trophy } from 'lucide-react'

interface ManagerRow {
  managerId: string
  managerName: string
  department?: string
  totalReports: number
  checkInsCompleted: number
  completionRate: number
}

interface ManagerEffectivenessTableProps {
  data: ManagerRow[]
}

export default function ManagerEffectivenessTable({ data }: ManagerEffectivenessTableProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#4a7c6f', fontSize: '13px', fontFamily: 'Georgia, serif' }}>
        No manager effectiveness data available.
      </div>
    )
  }

  const sorted = [...data].sort((a, b) => b.completionRate - a.completionRate)

  const getRankStyle = (index: number) => {
    if (index === 0) return { bg: '#fef9c3', color: '#854d0e', border: '#fde047' }
    if (index === 1) return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' }
    if (index === 2) return { bg: '#fff7ed', color: '#9a3412', border: '#fed7aa' }
    return { bg: 'white', color: '#0f4c3a', border: '#c9ebe4' }
  }

  const getRankLabel = (index: number) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `#${index + 1}`
  }

  return (
    <div style={{ fontFamily: 'Georgia, serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
        <Trophy size={14} color="#0d9488" />
        <span style={{ color: '#4a7c6f', fontSize: '12px' }}>Ranked by check-in completion rate</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sorted.map((row, index) => {
          const pct = Math.round(row.completionRate * 100)
          const rankStyle = getRankStyle(index)

          return (
            <div key={row.managerId} style={{
              background: rankStyle.bg,
              border: `1px solid ${rankStyle.border}`,
              borderRadius: '12px', padding: '12px 14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '16px', minWidth: '24px', textAlign: 'center' }}>
                    {getRankLabel(index)}
                  </span>
                  <div>
                    <p style={{ color: '#0f4c3a', fontWeight: 700, fontSize: '13px', margin: 0 }}>
                      {row.managerName}
                    </p>
                    {row.department && (
                      <p style={{ color: '#4a7c6f', fontSize: '11px', margin: '1px 0 0' }}>{row.department}</p>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#0d9488', fontWeight: 800, fontSize: '18px', fontFamily: 'Georgia, serif' }}>
                    {pct}%
                  </span>
                  <p style={{ color: '#4a7c6f', fontSize: '11px', margin: '1px 0 0' }}>
                    {row.checkInsCompleted}/{row.totalReports} done
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ background: '#e2e8f0', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                <div style={{
                  background: pct >= 80
                    ? 'linear-gradient(135deg, #0d9488, #06b6d4)'
                    : pct >= 50
                    ? 'linear-gradient(135deg, #f59e0b, #fbbf24)'
                    : 'linear-gradient(135deg, #e11d48, #fb7185)',
                  width: `${pct}%`, height: '100%', borderRadius: '999px',
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}