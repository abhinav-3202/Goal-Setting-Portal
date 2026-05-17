'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle, Loader2, Shield } from 'lucide-react'
import EscalationBadge from './EscalationsBadge'

interface EscalationEntry {
  _id: string
  ruleType: 'goal_not_submitted' | 'goal_not_approved' | 'checkin_missed'
  targetUserName: string
  targetUserEmail: string
  targetManagerName?: string
  department?: string
  status: 'warning' | 'escalated' | 'resolved'
  firedAt: string
  resolvedAt?: string
  daysOverdue: number
}

interface EscalationLogTableProps {
  entries: EscalationEntry[]
  onResolve: (id: string) => void
}

const RULE_LABELS: Record<string, { label: string; icon: string }> = {
  goal_not_submitted: { label: 'Goal Not Submitted', icon: '📝' },
  goal_not_approved:  { label: 'Goal Not Approved',  icon: '⏳' },
  checkin_missed:     { label: 'Check-in Missed',    icon: '📊' },
}

type FilterStatus = 'all' | 'warning' | 'escalated' | 'resolved'

export default function EscalationLogTable({ entries, onResolve }: EscalationLogTableProps) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [resolvingId, setResolvingId] = useState<string | null>(null)

  const filtered = filterStatus === 'all' ? entries : entries.filter((e) => e.status === filterStatus)

  const handleResolve = async (id: string) => {
    setResolvingId(id)
    try {
      onResolve(id)
      toast.success('Escalation marked as resolved')
    } catch {
      toast.error('Failed to resolve escalation')
    } finally {
      setResolvingId(null)
    }
  }

  if (entries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', fontFamily: 'Georgia, serif' }}>
        <Shield size={32} color="#c9ebe4" style={{ margin: '0 auto 14px', display: 'block' }} />
        <h3 style={{ color: '#0f4c3a', fontWeight: 700, fontSize: '17px', marginBottom: '8px' }}>All clear!</h3>
        <p style={{ color: '#4a7c6f', fontSize: '13px' }}>No escalations have been triggered yet.</p>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Georgia, serif' }}>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
        {(['all', 'warning', 'escalated', 'resolved'] as FilterStatus[]).map((s) => {
          const count = s === 'all' ? entries.length : entries.filter((e) => e.status === s).length
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: '6px 14px', borderRadius: '999px',
                border: filterStatus === s ? 'none' : '1px solid #c9ebe4',
                background: filterStatus === s ? 'linear-gradient(135deg, #0d9488, #06b6d4)' : 'white',
                color: filterStatus === s ? 'white' : '#4a7c6f',
                fontWeight: 600, fontSize: '12px', cursor: 'pointer',
                fontFamily: 'Georgia, serif', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              <span style={{
                background: filterStatus === s ? 'rgba(255,255,255,0.25)' : '#f0fdf9',
                color: filterStatus === s ? 'white' : '#0d9488',
                borderRadius: '999px', padding: '0 6px',
                fontSize: '11px', fontWeight: 800,
              }}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Entries */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length === 0 && (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '30px', fontSize: '13px' }}>
            No {filterStatus} escalations.
          </p>
        )}

        {filtered.map((entry) => {
          const rule = RULE_LABELS[entry.ruleType] ?? { label: entry.ruleType, icon: '⚠️' }
          const isResolved = entry.status === 'resolved'

          return (
            <div key={entry._id} style={{
              background: isResolved ? '#f8fafc' : 'white',
              border: `1px solid ${isResolved ? '#e2e8f0' : entry.status === 'escalated' ? '#fecdd3' : '#fde68a'}`,
              borderRadius: '14px', padding: '16px 18px',
              borderLeft: `4px solid ${isResolved ? '#e2e8f0' : entry.status === 'escalated' ? '#e11d48' : '#f59e0b'}`,
              opacity: isResolved ? 0.75 : 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '20px', flexShrink: 0, marginTop: '2px' }}>{rule.icon}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <span style={{ color: '#0f4c3a', fontWeight: 700, fontSize: '14px' }}>{entry.targetUserName}</span>
                      <EscalationBadge status={entry.status} />
                    </div>
                    <p style={{ color: '#4a7c6f', fontSize: '12px', margin: '0 0 2px' }}>
                      {entry.targetUserEmail}
                      {entry.department && <span> · {entry.department}</span>}
                    </p>
                    <p style={{ color: '#0f4c3a', fontSize: '13px', fontWeight: 600, margin: '4px 0 2px' }}>
                      {rule.label}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ color: '#94a3b8', fontSize: '11px' }}>
                        Triggered {new Date(entry.firedAt).toLocaleDateString()}
                      </span>
                      {entry.targetManagerName && (
                        <span style={{ color: '#4a7c6f', fontSize: '11px' }}>
                          Manager: <strong>{entry.targetManagerName}</strong>
                        </span>
                      )}
                      <span style={{
                        background: entry.daysOverdue > 14 ? '#fff1f2' : '#fffbeb',
                        color: entry.daysOverdue > 14 ? '#be123c' : '#92400e',
                        border: `1px solid ${entry.daysOverdue > 14 ? '#fecdd3' : '#fde68a'}`,
                        borderRadius: '999px', padding: '1px 8px',
                        fontSize: '11px', fontWeight: 700,
                      }}>
                        {entry.daysOverdue}d overdue
                      </span>
                    </div>
                  </div>
                </div>

                {!isResolved && (
                  <button
                    onClick={() => handleResolve(entry._id)}
                    disabled={resolvingId === entry._id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: resolvingId === entry._id ? '#99f6e4' : 'linear-gradient(135deg, #0d9488, #06b6d4)',
                      border: 'none', borderRadius: '10px',
                      padding: '8px 16px', color: 'white',
                      fontWeight: 600, fontSize: '12px',
                      cursor: resolvingId === entry._id ? 'not-allowed' : 'pointer',
                      fontFamily: 'Georgia, serif', flexShrink: 0,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    {resolvingId === entry._id
                      ? <><Loader2 size={12} className="animate-spin" /> Resolving…</>
                      : <><CheckCircle size={12} /> Mark Resolved</>}
                  </button>
                )}

                {isResolved && entry.resolvedAt && (
                  <span style={{ color: '#0d9488', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>
                    ✓ {new Date(entry.resolvedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}