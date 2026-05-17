'use client'
import ScoreIndicator from '../check-ins/ScoreIndicator'

interface GoalRow {
  goalTitle: string
  thrustArea: string
  uom: string
  target: string | number
  weightage: number
  Q1?: { actual: string | number; score: number }
  Q2?: { actual: string | number; score: number }
  Q3?: { actual: string | number; score: number }
  Q4?: { actual: string | number; score: number }
}

interface EmployeeRow {
  employeeId: string
  employeeName: string
  department?: string
  goals: GoalRow[]
}

interface AchievementTableProps {
  data: EmployeeRow[]
  visibleQuarters: ('Q1' | 'Q2' | 'Q3' | 'Q4')[]
}

export default function AchievementTable({ data, visibleQuarters }: AchievementTableProps) {
  if (data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#4a7c6f', fontFamily: 'Georgia, serif' }}>
        No data available for this period.
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid #c9ebe4', fontFamily: 'Georgia, serif' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '900px' }}>
        <thead>
          <tr style={{ background: 'linear-gradient(135deg, #0d9488, #06b6d4)' }}>
            <th style={{ padding: '12px 14px', color: 'white', fontWeight: 700, textAlign: 'left', fontSize: '12px' }}>Employee</th>
            <th style={{ padding: '12px 14px', color: 'white', fontWeight: 700, textAlign: 'left', fontSize: '12px' }}>Goal</th>
            <th style={{ padding: '12px 14px', color: 'white', fontWeight: 700, textAlign: 'left', fontSize: '12px' }}>UoM</th>
            <th style={{ padding: '12px 14px', color: 'white', fontWeight: 700, textAlign: 'left', fontSize: '12px' }}>Target</th>
            <th style={{ padding: '12px 14px', color: 'white', fontWeight: 700, textAlign: 'left', fontSize: '12px' }}>Wt%</th>
            {visibleQuarters.map((q) => (
              <th key={q} colSpan={2} style={{ padding: '12px 14px', color: 'white', fontWeight: 700, textAlign: 'center', fontSize: '12px', borderLeft: '1px solid rgba(255,255,255,0.2)' }}>
                {q}
              </th>
            ))}
          </tr>
          {/* Sub-header for quarters */}
          <tr style={{ background: '#f0fdf9' }}>
            <td colSpan={5} />
            {visibleQuarters.map((q) => (
              <>
                <td key={`${q}-actual`} style={{ padding: '6px 12px', color: '#4a7c6f', fontSize: '11px', fontWeight: 600, borderLeft: '1px solid #c9ebe4' }}>Actual</td>
                <td key={`${q}-score`} style={{ padding: '6px 12px', color: '#4a7c6f', fontSize: '11px', fontWeight: 600 }}>Score</td>
              </>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((emp) =>
            emp.goals.map((goal, gIdx) => (
              <tr
                key={`${emp.employeeId}-${gIdx}`}
                style={{ background: gIdx % 2 === 0 ? 'white' : '#f8fffe', borderTop: '1px solid #e8f4f1' }}
              >
                {/* Employee — only in first goal row */}
                {gIdx === 0 ? (
                  <td
                    rowSpan={emp.goals.length}
                    style={{ padding: '12px 14px', verticalAlign: 'top', borderRight: '1px solid #e8f4f1' }}
                  >
                    <div style={{
                      background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
                      color: 'white', borderRadius: '50%',
                      width: '30px', height: '30px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 700, marginBottom: '6px',
                    }}>
                      {emp.employeeName.charAt(0)}
                    </div>
                    <p style={{ fontWeight: 700, color: '#0f4c3a', fontSize: '13px', margin: 0 }}>{emp.employeeName}</p>
                    {emp.department && <p style={{ color: '#4a7c6f', fontSize: '11px', margin: '2px 0 0' }}>{emp.department}</p>}
                  </td>
                ) : null}

                <td style={{ padding: '12px 14px' }}>
                  <p style={{ fontWeight: 600, color: '#0f4c3a', margin: 0 }}>{goal.goalTitle}</p>
                  <p style={{ color: '#4a7c6f', fontSize: '11px', margin: '2px 0 0' }}>{goal.thrustArea}</p>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ background: '#f0fdf9', color: '#0d9488', border: '1px solid #99f6e4', borderRadius: '999px', padding: '3px 8px', fontSize: '11px', fontWeight: 600 }}>
                    {{ min: 'Higher', max: 'Lower', timeline: 'Date', zero: 'Zero' }[goal.uom] ?? goal.uom}
                  </span>
                </td>
                <td style={{ padding: '12px 14px', color: '#0f4c3a', fontWeight: 600 }}>{goal.target}</td>
                <td style={{ padding: '12px 14px', color: '#0d9488', fontWeight: 700 }}>{goal.weightage}%</td>

                {visibleQuarters.map((q) => {
                  const entry = goal[q]
                  return (
                    <>
                      <td key={`${q}-actual`} style={{ padding: '12px', color: entry ? '#0f4c3a' : '#94a3b8', fontWeight: entry ? 600 : 400, borderLeft: '1px solid #e8f4f1' }}>
                        {entry?.actual ?? '—'}
                      </td>
                      <td key={`${q}-score`} style={{ padding: '12px' }}>
                        <ScoreIndicator score={entry?.score ?? null} uom={goal.uom} />
                      </td>
                    </>
                  )
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}