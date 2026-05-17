'use client'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

interface EmployeeStatus {
  employeeId: string
  employeeName: string
  department?: string
  managerName?: string
  checkInDone: boolean
  managerCheckInDone: boolean
  submittedAt?: string
}

interface CompletionDashboardProps {
  data: EmployeeStatus[]
  quarter: string
  totalEmployees: number
  completedCount: number
}

export default function CompletionDashboard({ data, quarter, totalEmployees, completedCount }: CompletionDashboardProps) {
  const pct = totalEmployees > 0 ? Math.round((completedCount / totalEmployees) * 100) : 0

  return (
    <div style={{ fontFamily: 'Georgia, serif' }}>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          {
            label: 'Total Employees',
            value: totalEmployees,
            bg: 'white', color: '#0f4c3a', border: '#c9ebe4',
            icon: '👥',
          },
          {
            label: 'Check-ins Done',
            value: completedCount,
            bg: '#f0fdf9', color: '#0d9488', border: '#99f6e4',
            icon: '✅',
          },
          {
            label: 'Pending',
            value: totalEmployees - completedCount,
            bg: '#fffbeb', color: '#92400e', border: '#fde68a',
            icon: '⏳',
          },
        ].map((card) => (
          <div key={card.label} style={{
            background: card.bg, border: `1px solid ${card.border}`,
            borderRadius: '16px', padding: '18px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>{card.icon}</div>
            <div style={{ color: card.color, fontWeight: 800, fontSize: '28px', fontFamily: 'Georgia, serif' }}>{card.value}</div>
            <div style={{ color: '#4a7c6f', fontSize: '12px', marginTop: '2px' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ background: 'white', border: '1px solid #c9ebe4', borderRadius: '16px', padding: '18px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ color: '#0f4c3a', fontWeight: 700, fontSize: '14px' }}>{quarter} Completion Rate</span>
          <span style={{ color: '#0d9488', fontWeight: 800, fontSize: '18px' }}>{pct}%</span>
        </div>
        <div style={{ background: '#e2e8f0', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
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

      {/* Employee grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
        {data.map((emp) => (
          <div key={emp.employeeId} style={{
            background: emp.checkInDone ? '#f0fdf9' : 'white',
            border: `1px solid ${emp.checkInDone ? '#99f6e4' : '#e2e8f0'}`,
            borderRadius: '14px', padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{
                background: emp.checkInDone
                  ? 'linear-gradient(135deg, #0d9488, #06b6d4)'
                  : '#e2e8f0',
                color: emp.checkInDone ? 'white' : '#94a3b8',
                borderRadius: '50%', width: '36px', height: '36px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: 700,
              }}>
                {emp.employeeName.charAt(0)}
              </div>
              <div>
                <p style={{ color: '#0f4c3a', fontWeight: 700, fontSize: '13px', margin: 0 }}>{emp.employeeName}</p>
                {emp.department && <p style={{ color: '#4a7c6f', fontSize: '11px', margin: '1px 0 0' }}>{emp.department}</p>}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#4a7c6f', fontSize: '12px' }}>Employee check-in</span>
                {emp.checkInDone
                  ? <CheckCircle size={15} color="#0d9488" />
                  : <XCircle size={15} color="#e11d48" />}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#4a7c6f', fontSize: '12px' }}>Manager check-in</span>
                {emp.managerCheckInDone
                  ? <CheckCircle size={15} color="#0d9488" />
                  : <Clock size={15} color="#f59e0b" />}
              </div>
              {emp.managerName && (
                <p style={{ color: '#94a3b8', fontSize: '11px', margin: '2px 0 0' }}>
                  Manager: {emp.managerName}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}