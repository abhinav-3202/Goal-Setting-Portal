'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import GoalSheetReadOnly from '@/components/goals/GoalSheetReadOnly'
import GoalStatusBadge from '@/components/goals/GoalStatusBadge'

interface GoalSheetData {
  _id: string
  status: 'draft' | 'submitted' | 'approved' | 'locked'
  cycleName: string
  lockedAt?: string
  returnComment?: string
  employeeName: string
  goals: any[]
  submittedAt?: string
  createdAt: string
}

export default function GoalSheetViewPage() {
  const params = useParams()
  const router = useRouter()
  const goalSheetId = params.goalSheetId as string

  const [sheet, setSheet] = useState<GoalSheetData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/goals/${goalSheetId}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then(setSheet)
      .catch(() => setError('Goal sheet not found or you do not have access.'))
      .finally(() => setLoading(false))
  }, [goalSheetId])

  if (loading) {
    return (
      <div style={{ background: '#f0faf8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={36} color="#0d9488" style={{ margin: '0 auto 14px', display: 'block', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#4a7c6f', fontSize: '14px' }}>Loading goal sheet…</p>
        </div>
      </div>
    )
  }

  if (error || !sheet) {
    return (
      <div style={{ background: '#f0faf8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
        <div style={{
          background: 'white', border: '1px solid #fecdd3',
          borderRadius: '20px', padding: '40px', textAlign: 'center', maxWidth: '400px',
        }}>
          <p style={{ color: '#e11d48', fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>Something went wrong</p>
          <p style={{ color: '#4a7c6f', fontSize: '13px', marginBottom: '20px' }}>{error}</p>
          <button
            onClick={() => router.push('/employee/goals')}
            style={{
              background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
              color: 'white', border: 'none', borderRadius: '10px',
              padding: '10px 22px', fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Georgia, serif',
            }}
          >
            Back to Goals
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#f0faf8', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>
      <div style={{
        background: 'radial-gradient(circle, rgba(13,148,136,0.09) 0%, transparent 70%)',
        position: 'fixed', top: 0, left: 0, width: '450px', height: '450px',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>

        {/* Back */}
        <button
          onClick={() => router.push('/employee/goals')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', color: '#4a7c6f',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            marginBottom: '24px', fontFamily: 'Georgia, serif', padding: 0,
          }}
        >
          <ArrowLeft size={15} /> Back to My Goals
        </button>

        {/* Header */}
        <div style={{
          background: 'white', borderRadius: '24px',
          border: '1px solid #c9ebe4',
          boxShadow: '0 4px 24px rgba(13,148,136,0.07)',
          padding: '26px 28px', marginBottom: '18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ color: '#0f4c3a', fontWeight: 800, fontSize: '22px', margin: '0 0 4px' }}>
                Goal Sheet
              </h1>
              <p style={{ color: '#4a7c6f', fontSize: '13px', margin: 0 }}>
                Cycle: <strong style={{ color: '#0f4c3a' }}>{sheet.cycleName}</strong>
                {sheet.submittedAt && (
                  <span> · Submitted {new Date(sheet.submittedAt).toLocaleDateString()}</span>
                )}
              </p>
            </div>
            <GoalStatusBadge status={sheet.status} />
          </div>

          {/* Submitted info bar */}
          {sheet.status === 'submitted' && (
            <div style={{
              marginTop: '16px', background: '#fffbeb',
              border: '1px solid #fde68a', borderRadius: '10px',
              padding: '10px 14px',
            }}>
              <p style={{ color: '#92400e', fontSize: '13px', fontWeight: 500, margin: 0 }}>
                ⏳ Your goal sheet is awaiting manager approval. You cannot make changes at this time.
              </p>
            </div>
          )}

          {/* Locked info bar */}
          {sheet.status === 'locked' && (
            <div style={{
              marginTop: '16px', background: '#eff6ff',
              border: '1px solid #bfdbfe', borderRadius: '10px',
              padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{ fontSize: '16px' }}>🔒</span>
              <p style={{ color: '#1e40af', fontSize: '13px', fontWeight: 500, margin: 0 }}>
                Goals approved and locked on {sheet.lockedAt ? new Date(sheet.lockedAt).toLocaleDateString() : '—'}.
                You can now log quarterly achievements in Check-ins.
              </p>
            </div>
          )}
        </div>

        {/* Goal sheet content */}
        <div style={{
          background: 'white', borderRadius: '24px',
          border: '1px solid #c9ebe4',
          boxShadow: '0 4px 24px rgba(13,148,136,0.07)',
          padding: '26px 28px',
        }}>
          <GoalSheetReadOnly
            goals={sheet.goals}
            status={sheet.status}
            lockedAt={sheet.lockedAt}
            returnComment={sheet.returnComment}
            cycleName={sheet.cycleName}
          />
        </div>

        {/* Go to check-ins CTA when locked */}
        {sheet.status === 'locked' && (
          <button
            onClick={() => router.push('/employee/check-ins')}
            style={{
              marginTop: '16px', width: '100%', padding: '13px',
              background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
              border: 'none', borderRadius: '14px',
              color: 'white', fontWeight: 700, fontSize: '15px',
              cursor: 'pointer', fontFamily: 'Georgia, serif',
              boxShadow: '0 4px 14px rgba(13,148,136,0.2)',
            }}
          >
            Log Quarterly Achievement →
          </button>
        )}
      </div>
    </div>
  )
}