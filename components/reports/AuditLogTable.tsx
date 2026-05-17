'use client'
import { Shield } from 'lucide-react'

interface AuditEntry {
  _id: string
  entityType: string
  entityId: string
  action: string
  changedBy: { name: string; email: string; role: string }
  changes?: Array<{ field: string; old: string; new: string }>
  comment?: string
  timestamp: string
}

interface AuditLogTableProps {
  entries: AuditEntry[]
}

const ACTION_CONFIG: Record<string, { bg: string; color: string; border: string }> = {
  submitted:  { bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
  approved:   { bg: '#f0fdf9', color: '#0d9488', border: '#99f6e4' },
  returned:   { bg: '#fff7ed', color: '#9a3412', border: '#fed7aa' },
  unlocked:   { bg: '#fdf2f8', color: '#86198f', border: '#f0abfc' },
  edited:     { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
}

export default function AuditLogTable({ entries }: AuditLogTableProps) {
  if (entries.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '60px 20px',
        background: 'white', borderRadius: '16px', border: '1px solid #c9ebe4',
        fontFamily: 'Georgia, serif',
      }}>
        <Shield size={32} color="#c9ebe4" style={{ marginBottom: '12px' }} />
        <p style={{ color: '#4a7c6f', fontSize: '14px' }}>No audit entries found for this period.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontFamily: 'Georgia, serif' }}>
      {entries.map((entry) => {
        const cfg = ACTION_CONFIG[entry.action] ?? { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' }
        return (
          <div key={entry._id} style={{
            background: 'white', border: '1px solid #c9ebe4',
            borderRadius: '14px', padding: '16px 18px',
            borderLeft: `4px solid ${cfg.border}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Action badge */}
                <span style={{
                  background: cfg.bg, color: cfg.color,
                  border: `1px solid ${cfg.border}`,
                  borderRadius: '999px', padding: '3px 10px',
                  fontSize: '11px', fontWeight: 700, textTransform: 'capitalize',
                }}>
                  {entry.action}
                </span>
                <span style={{ color: '#0f4c3a', fontWeight: 600, fontSize: '13px' }}>
                  {entry.changedBy.name}
                </span>
                <span style={{ color: '#4a7c6f', fontSize: '12px' }}>({entry.changedBy.role})</span>
              </div>
              <span style={{ color: '#94a3b8', fontSize: '12px', flexShrink: 0 }}>
                {new Date(entry.timestamp).toLocaleString()}
              </span>
            </div>

            {/* Changes */}
            {entry.changes && entry.changes.length > 0 && (
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {entry.changes.map((c, i) => (
                  <div key={i} style={{
                    background: '#f8fafc', borderRadius: '8px', padding: '6px 12px',
                    fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>{c.field}</span>
                    <span style={{ color: '#e11d48', textDecoration: 'line-through' }}>{c.old}</span>
                    <span style={{ color: '#94a3b8' }}>→</span>
                    <span style={{ color: '#0d9488', fontWeight: 600 }}>{c.new}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Comment */}
            {entry.comment && (
              <div style={{ marginTop: '8px', background: '#f8fafc', borderRadius: '8px', padding: '8px 12px' }}>
                <p style={{ color: '#4a7c6f', fontSize: '12px', margin: 0, fontStyle: 'italic' }}>
                  "{entry.comment}"
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}