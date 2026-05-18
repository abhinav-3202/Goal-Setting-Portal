'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Lock } from 'lucide-react'
import CheckInForm from '@/components/check-ins/CheckInForm'

type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4'

interface ActiveCycle {
  _id: string
  name: string
  activeQuarter: Quarter
  phase: string
}

interface GoalSheet {
  _id: string
  goals: any[]
  cycleName: string
}

interface CheckIn {
  _id: string
  quarter: Quarter
  goals: Array<{ goalId: string; actual: string; statusTag: string }>
}

export default function EmployeeCheckInsPage() {
  const router = useRouter()
  const [cycle, setCycle] = useState<ActiveCycle | null>(null)
  const [goalSheet, setGoalSheet] = useState<GoalSheet | null>(null)
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/cycles/active').then((r) => r.json()),
      fetch('/api/goals?status=locked').then((r) => r.json()),
      fetch('/api/check-ins').then((r) => r.json()),
    ])
      .then(([cycleData, goalsData, checkInsData]) => {
        setCycle(cycleData)
        // Take the first locked sheet (current cycle)
        if (Array.isArray(goalsData) && goalsData.length > 0) {
          setGoalSheet(goalsData[0])
        }
        if (Array.isArray(checkInsData)) {
          setCheckIns(checkInsData)
        }
      })
      .catch(() => setError('Failed to load check-in data. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ background: '#f0faf8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={36} color="#0d9488" style={{ margin: '0 auto 14px', display: 'block', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#4a7c6f', fontSize: '14px' }}>Loading check-ins…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ background: '#f0faf8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
        <div style={{ background: 'white', border: '1px solid #fecdd3', borderRadius: '20px', padding: '40px', textAlign: 'center', maxWidth: '400px' }}>
          <p style={{ color: '#e11d48', fontWeight: 700, marginBottom: '8px' }}>Error</p>
          <p style={{ color: '#4a7c6f', fontSize: '13px' }}>{error}</p>
        </div>
      </div>
    )
  }

  // No locked goal sheet
  if (!goalSheet) {
    return (
      <div style={{ background: '#f0faf8', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto', padding: '40px 24px' }}>
          <button
            onClick={() => router.push('/employee/goals')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#4a7c6f', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '24px', fontFamily: 'Georgia, serif', padding: 0 }}
          >
            <ArrowLeft size={15} /> Back to Goals
          </button>

          <div style={{
            background: 'white', borderRadius: '24px', border: '1px solid #c9ebe4',
            boxShadow: '0 4px 24px rgba(13,148,136,0.07)',
            padding: '60px 40px', textAlign: 'center',
          }}>
            <div style={{ background: '#e2e8f0', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <Lock size={26} color="#94a3b8" />
            </div>
            <h2 style={{ color: '#0f4c3a', fontWeight: 800, fontSize: '20px', marginBottom: '8px' }}>
              No Approved Goals Found
            </h2>
            <p style={{ color: '#4a7c6f', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
              You can only log check-ins once your manager has approved and locked your goals.
              Make sure to submit your goal sheet first.
            </p>
            <button
              onClick={() => router.push('/employee/goals')}
              style={{
                background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
                color: 'white', border: 'none', borderRadius: '12px',
                padding: '12px 28px', fontWeight: 700, fontSize: '14px',
                cursor: 'pointer', fontFamily: 'Georgia, serif',
              }}
            >
              Go to My Goals
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#f0faf8', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>
      <div style={{
        background: 'radial-gradient(circle, rgba(13,148,136,0.09) 0%, transparent 70%)',
        position: 'fixed', bottom: 0, right: 0, width: '400px', height: '400px',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>

        {/* Back */}
        <button
          onClick={() => router.push('/goals')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#4a7c6f', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '24px', fontFamily: 'Georgia, serif', padding: 0 }}
        >
          <ArrowLeft size={15} /> Back to My Goals
        </button>

        {/* Header */}
        <div style={{
          background: 'white', borderRadius: '24px', border: '1px solid #c9ebe4',
          boxShadow: '0 4px 24px rgba(13,148,136,0.07)',
          padding: '26px 28px', marginBottom: '18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
              borderRadius: '14px', padding: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 style={{ color: '#0f4c3a', fontWeight: 800, fontSize: '24px', margin: 0 }}>
                Quarterly Check-ins
              </h1>
              <p style={{ color: '#4a7c6f', fontSize: '13px', margin: '3px 0 0' }}>
                Cycle: <strong style={{ color: '#0f4c3a' }}>{goalSheet.cycleName}</strong>
                {cycle && (
                  <span> · Active window: <strong style={{ color: '#0d9488' }}>{cycle.activeQuarter}</strong></span>
                )}
              </p>
            </div>
          </div>

          {/* Active window badge */}
          {cycle && (
            <div style={{
              marginTop: '16px', background: '#f0fdf9',
              border: '1px solid #99f6e4', borderRadius: '10px',
              padding: '10px 14px',
            }}>
              <p style={{ color: '#0f4c3a', fontSize: '13px', fontWeight: 500, margin: 0 }}>
                ✏️ <strong>{cycle.activeQuarter} check-in window is open.</strong> Log your actual achievements below.
                Past quarters are visible but read-only.
              </p>
            </div>
          )}
        </div>

        {/* Check-in form card */}
        <div style={{
          background: 'white', borderRadius: '24px', border: '1px solid #c9ebe4',
          boxShadow: '0 4px 24px rgba(13,148,136,0.07)',
          padding: '26px 28px',
        }}>
          <CheckInForm
            goals={goalSheet.goals}
            goalSheetId={goalSheet._id}
            activeQuarter={cycle?.activeQuarter ?? 'Q1'}
            existingCheckIns={checkIns}
          />
        </div>
      </div>
    </div>
  )
}