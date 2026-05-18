'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Target, Loader2, ClipboardList } from 'lucide-react'
import GoalStatusBadge from '@/components/goals/GoalStatusBadge'

interface GoalSheet {
  _id: string
  status: 'draft' | 'submitted' | 'approved' | 'locked'
  cycleName: string
  goalCount: number
  totalWeightage: number
  submittedAt?: string
  lockedAt?: string
  returnComment?: string
  createdAt: string
}

export default function EmployeeGoalsPage() {
  const router = useRouter()
  const [sheets, setSheets] = useState<GoalSheet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/goals')
      .then((r) => r.json())
      .then((data) => setSheets(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div
      style={{ background: '#f0faf8', minHeight: '100vh', fontFamily: 'Georgia, serif' }}
    >
      {/* Decorative blobs */}
      <div
        style={{
          background: 'radial-gradient(circle, rgba(13,148,136,0.1) 0%, transparent 70%)',
          position: 'fixed', top: 0, left: 0, width: '500px', height: '500px',
          borderRadius: '50%', pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ color: '#0f4c3a', fontWeight: 800, fontSize: '28px', margin: 0 }}>
              My Goals
            </h1>
            <p style={{ color: '#4a7c6f', fontSize: '14px', marginTop: '4px' }}>
              Track and manage your performance goals
            </p>
          </div>
          <button
            onClick={() => router.push('/goals/new')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
              color: 'white', border: 'none', borderRadius: '12px',
              padding: '12px 22px', fontWeight: 700, fontSize: '14px',
              cursor: 'pointer', fontFamily: 'Georgia, serif',
              boxShadow: '0 4px 14px rgba(13,148,136,0.25)',
              transition: 'opacity 0.2s',
            }}
          >
            <Plus size={16} /> New Goal Sheet
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Loader2 size={32} color="#0d9488" style={{ margin: '0 auto 12px', display: 'block', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#4a7c6f', fontSize: '14px' }}>Loading your goals…</p>
          </div>
        )}

        {/* Empty */}
        {!loading && sheets.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '80px 20px',
            background: 'white', borderRadius: '24px',
            border: '1px solid #c9ebe4',
            boxShadow: '0 4px 20px rgba(13,148,136,0.06)',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
              width: '64px', height: '64px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 18px',
            }}>
              <ClipboardList size={28} color="white" />
            </div>
            <h2 style={{ color: '#0f4c3a', fontWeight: 800, fontSize: '20px', marginBottom: '8px' }}>
              No goal sheets yet
            </h2>
            <p style={{ color: '#4a7c6f', fontSize: '14px', marginBottom: '24px' }}>
              Create your first goal sheet for the current cycle
            </p>
            <button
              onClick={() => router.push('/goals/new')}
              style={{
                background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
                color: 'white', border: 'none', borderRadius: '12px',
                padding: '12px 28px', fontWeight: 700, fontSize: '14px',
                cursor: 'pointer', fontFamily: 'Georgia, serif',
              }}
            >
              Create Goal Sheet
            </button>
          </div>
        )}

        {/* Sheets list */}
        {!loading && sheets.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {sheets.map((sheet) => (
              <div
                key={sheet._id}
                style={{
                  background: 'white', border: '1px solid #c9ebe4',
                  borderRadius: '20px', padding: '22px 24px',
                  boxShadow: '0 2px 12px rgba(13,148,136,0.05)',
                  transition: 'box-shadow 0.2s, border-color 0.2s',
                  cursor: 'pointer',
                  borderLeft: sheet.status === 'locked' ? '4px solid #3b82f6'
                    : sheet.status === 'submitted' ? '4px solid #f59e0b'
                    : sheet.status === 'draft' ? '4px solid #94a3b8'
                    : '4px solid #0d9488',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(13,148,136,0.13)'
                  e.currentTarget.style.borderColor = '#0d9488'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(13,148,136,0.05)'
                  e.currentTarget.style.borderColor = '#c9ebe4'
                }}
                onClick={() =>
                  sheet.status === 'draft'
                    ? router.push(`/goals/new?edit=${sheet._id}`)
                    : router.push(`/goals/${sheet._id}`)
                }
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
                      borderRadius: '12px', padding: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Target size={20} color="white" />
                    </div>
                    <div>
                      <h3 style={{ color: '#0f4c3a', fontWeight: 700, fontSize: '16px', margin: 0 }}>
                        {sheet.cycleName}
                      </h3>
                      <p style={{ color: '#4a7c6f', fontSize: '13px', margin: '3px 0 0' }}>
                        {sheet.goalCount} goals · Total weightage: {sheet.totalWeightage}%
                      </p>
                    </div>
                  </div>
                  <GoalStatusBadge status={sheet.status} />
                </div>

                {/* Return comment */}
                {sheet.returnComment && (
                  <div style={{
                    marginTop: '14px', background: '#fff7ed',
                    border: '1px solid #fed7aa', borderRadius: '10px',
                    padding: '10px 14px',
                  }}>
                    <p style={{ color: '#9a3412', fontSize: '12px', fontWeight: 600, margin: '0 0 2px' }}>
                      ⚠ Returned for rework
                    </p>
                    <p style={{ color: '#9a3412', fontSize: '12px', margin: 0 }}>{sheet.returnComment}</p>
                  </div>
                )}

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #e8f4f1' }}>
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                    Created {new Date(sheet.createdAt).toLocaleDateString()}
                    {sheet.submittedAt && ` · Submitted ${new Date(sheet.submittedAt).toLocaleDateString()}`}
                  </span>
                  <span style={{
                    color: '#0d9488', fontSize: '13px', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}>
                    {sheet.status === 'draft' ? 'Edit & Submit →' : 'View Details →'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}