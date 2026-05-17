'use client'
import { useRouter } from 'next/navigation'
import { Clock, ChevronRight, User } from 'lucide-react'

interface PendingItem {
  goalSheetId: string
  employeeName: string
  employeeEmail: string
  department?: string
  submittedAt: string
  goalCount: number
}

interface PendingListProps {
  items: PendingItem[]
}

export default function PendingList({ items }: PendingListProps) {
  const router = useRouter()

  if (items.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '60px 20px',
        background: 'white', borderRadius: '20px',
        border: '1px solid #c9ebe4',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
          width: '56px', height: '56px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <Clock size={24} color="white" />
        </div>
        <h3 style={{ color: '#0f4c3a', fontWeight: 700, fontSize: '18px', marginBottom: '8px', fontFamily: 'Georgia, serif' }}>
          All caught up!
        </h3>
        <p style={{ color: '#4a7c6f', fontSize: '14px' }}>No pending goal sheets to review.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {items.map((item) => (
        <div
          key={item.goalSheetId}
          onClick={() => router.push(`/approvals/${item.goalSheetId}`)}
          style={{
            background: 'white',
            border: '1px solid #c9ebe4',
            borderRadius: '16px',
            padding: '18px 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'box-shadow 0.2s, border-color 0.2s',
            gap: '12px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(13,148,136,0.12)'
            e.currentTarget.style.borderColor = '#0d9488'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.borderColor = '#c9ebe4'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Avatar */}
            <div style={{
              background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
              color: 'white', borderRadius: '50%',
              width: '44px', height: '44px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', fontWeight: 700, fontFamily: 'Georgia, serif',
            }}>
              {item.employeeName.charAt(0).toUpperCase()}
            </div>

            <div>
              <p style={{ color: '#0f4c3a', fontWeight: 700, fontSize: '15px', margin: 0, fontFamily: 'Georgia, serif' }}>
                {item.employeeName}
              </p>
              <p style={{ color: '#4a7c6f', fontSize: '12px', margin: '2px 0 0' }}>
                {item.employeeEmail}
                {item.department && <span> · {item.department}</span>}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                background: '#fffbeb', color: '#92400e',
                border: '1px solid #fde68a',
                borderRadius: '999px', padding: '4px 12px',
                fontSize: '12px', fontWeight: 600, marginBottom: '4px',
                display: 'inline-block',
              }}>
                {item.goalCount} Goals
              </div>
              <p style={{ color: '#64748b', fontSize: '11px', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={10} />
                {new Date(item.submittedAt).toLocaleDateString()}
              </p>
            </div>
            <ChevronRight size={18} color="#0d9488" />
          </div>
        </div>
      ))}
    </div>
  )
}