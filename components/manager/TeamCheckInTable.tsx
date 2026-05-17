'use client'
import ScoreIndicator from '../check-ins/ScoreIndicator'
import CheckInStatusBadge from '../check-ins/CheckInStatusBadge'
import { User } from 'lucide-react'

interface GoalCheckIn {
  goalTitle: string
  thrustArea: string
  uom: string
  target: string | number
  actual?: string | number
  computedScore?: number
  statusTag?: 'not_started' | 'on_track' | 'completed'
  weightage: number
}

interface TeamMember {
  employeeId: string
  employeeName: string
  department?: string
  isManagerDone: boolean
  goals: GoalCheckIn[]
}

interface TeamCheckInTableProps {
  members: TeamMember[]
  quarter: string
  onSelectMember: (employeeId: string) => void
  selectedMemberId: string | null
}

export default function TeamCheckInTable({ members, quarter, onSelectMember, selectedMemberId }: TeamCheckInTableProps) {
  const selected = members.find((m) => m.employeeId === selectedMemberId)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px', fontFamily: 'Georgia, serif' }}>

      {/* Left: member list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ color: '#4a7c6f', fontSize: '12px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Team Members — {quarter}
        </p>
        {members.map((m) => (
          <button
            key={m.employeeId}
            onClick={() => onSelectMember(m.employeeId)}
            style={{
              background: selectedMemberId === m.employeeId
                ? 'linear-gradient(135deg, #0d9488, #06b6d4)'
                : 'white',
              border: selectedMemberId === m.employeeId ? 'none' : '1px solid #c9ebe4',
              borderRadius: '12px', padding: '12px 14px',
              cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: selectedMemberId === m.employeeId ? 'rgba(255,255,255,0.3)' : 'linear-gradient(135deg, #0d9488, #06b6d4)',
                color: 'white', borderRadius: '50%',
                width: '32px', height: '32px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 700,
              }}>
                {m.employeeName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ color: selectedMemberId === m.employeeId ? 'white' : '#0f4c3a', fontWeight: 700, fontSize: '13px', margin: 0 }}>
                  {m.employeeName}
                </p>
                <p style={{ color: selectedMemberId === m.employeeId ? 'rgba(255,255,255,0.75)' : '#4a7c6f', fontSize: '11px', margin: 0 }}>
                  {m.department ?? 'No dept'}
                </p>
              </div>
            </div>
            {m.isManagerDone && (
              <span style={{
                display: 'inline-block', marginTop: '8px',
                background: selectedMemberId === m.employeeId ? 'rgba(255,255,255,0.2)' : '#f0fdf9',
                color: selectedMemberId === m.employeeId ? 'white' : '#0d9488',
                fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
              }}>
                ✓ Check-in Done
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Right: goals table */}
      <div>
        {!selected ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: 'white', borderRadius: '16px', border: '1px solid #c9ebe4',
          }}>
            <User size={32} color="#c9ebe4" style={{ marginBottom: '12px' }} />
            <p style={{ color: '#4a7c6f', fontSize: '14px' }}>Select a team member to view their check-in data</p>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <h3 style={{ color: '#0f4c3a', fontWeight: 800, fontSize: '17px', margin: 0, fontFamily: 'Georgia, serif' }}>
                {selected.employeeName}
              </h3>
              <span style={{ color: '#4a7c6f', fontSize: '13px' }}>{quarter} Check-in</span>
            </div>

            <div style={{ overflowX: 'auto', borderRadius: '14px', border: '1px solid #c9ebe4' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #0d9488, #06b6d4)' }}>
                    {['Goal', 'Target', 'Actual', 'Score', 'Status', 'Weight'].map((h) => (
                      <th key={h} style={{ padding: '10px 12px', color: 'white', fontWeight: 700, textAlign: 'left', fontSize: '12px' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selected.goals.map((g, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#f8fffe', borderTop: '1px solid #e8f4f1' }}>
                      <td style={{ padding: '12px', color: '#0f4c3a', maxWidth: '160px' }}>
                        <p style={{ fontWeight: 600, margin: 0 }}>{g.goalTitle}</p>
                        <p style={{ color: '#4a7c6f', fontSize: '11px', margin: '2px 0 0' }}>{g.thrustArea}</p>
                      </td>
                      <td style={{ padding: '12px', color: '#0f4c3a', fontWeight: 600 }}>
                        {g.uom === 'timeline' ? new Date(g.target).toLocaleDateString() : g.target}
                      </td>
                      <td style={{ padding: '12px', color: g.actual ? '#0f4c3a' : '#94a3b8', fontWeight: g.actual ? 600 : 400 }}>
                        {g.actual
                          ? g.uom === 'timeline' ? new Date(g.actual).toLocaleDateString() : g.actual
                          : '—'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <ScoreIndicator score={g.computedScore ?? null} uom={g.uom} />
                      </td>
                      <td style={{ padding: '12px' }}>
                        {g.statusTag
                          ? <CheckInStatusBadge status={g.statusTag} />
                          : <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#0d9488' }}>
                        {g.weightage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}