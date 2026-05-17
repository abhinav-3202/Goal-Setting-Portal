import * as XLSX from 'xlsx'

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
  employeeName: string
  department?: string
  goals: GoalRow[]
}

const UOM_LABELS: Record<string, string> = {
  min: 'Higher Better',
  max: 'Lower Better',
  timeline: 'Timeline',
  zero: 'Zero-based',
}

export function generateAchievementExcel(data: EmployeeRow[]): Buffer {
  const wb = XLSX.utils.book_new()

  // ── Sheet 1: Achievement Report ──
  const rows: any[][] = []

  // Header row
  rows.push([
    'Employee', 'Department', 'Goal Title', 'Thrust Area',
    'UoM', 'Target', 'Weightage %',
    'Q1 Actual', 'Q1 Score %',
    'Q2 Actual', 'Q2 Score %',
    'Q3 Actual', 'Q3 Score %',
    'Q4 Actual', 'Q4 Score %',
  ])

  // Data rows
  for (const emp of data) {
    for (const goal of emp.goals) {
      rows.push([
        emp.employeeName,
        emp.department ?? '',
        goal.goalTitle,
        goal.thrustArea,
        UOM_LABELS[goal.uom] ?? goal.uom,
        goal.target,
        goal.weightage,
        goal.Q1?.actual ?? '—',
        goal.Q1?.score != null ? `${Math.round(goal.Q1.score * 100)}%` : '—',
        goal.Q2?.actual ?? '—',
        goal.Q2?.score != null ? `${Math.round(goal.Q2.score * 100)}%` : '—',
        goal.Q3?.actual ?? '—',
        goal.Q3?.score != null ? `${Math.round(goal.Q3.score * 100)}%` : '—',
        goal.Q4?.actual ?? '—',
        goal.Q4?.score != null ? `${Math.round(goal.Q4.score * 100)}%` : '—',
      ])
    }
  }

  const ws = XLSX.utils.aoa_to_sheet(rows)

  // Column widths
  ws['!cols'] = [
    { wch: 22 }, { wch: 18 }, { wch: 32 }, { wch: 22 },
    { wch: 14 }, { wch: 12 }, { wch: 12 },
    { wch: 12 }, { wch: 10 },
    { wch: 12 }, { wch: 10 },
    { wch: 12 }, { wch: 10 },
    { wch: 12 }, { wch: 10 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Achievement Report')

  // ── Sheet 2: Summary by Employee ──
  const summaryRows: any[][] = [
    ['Employee', 'Department', 'Total Goals', 'Q1 Avg Score', 'Q2 Avg Score', 'Q3 Avg Score', 'Q4 Avg Score'],
  ]

  for (const emp of data) {
    const avgScore = (q: 'Q1' | 'Q2' | 'Q3' | 'Q4') => {
      const scores = emp.goals.map((g) => g[q]?.score).filter((s) => s != null) as number[]
      if (scores.length === 0) return '—'
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length
      return `${Math.round(avg * 100)}%`
    }

    summaryRows.push([
      emp.employeeName,
      emp.department ?? '',
      emp.goals.length,
      avgScore('Q1'), avgScore('Q2'), avgScore('Q3'), avgScore('Q4'),
    ])
  }

  const ws2 = XLSX.utils.aoa_to_sheet(summaryRows)
  ws2['!cols'] = [{ wch: 22 }, { wch: 18 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'Employee Summary')

  // Write to buffer
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  return buf
}