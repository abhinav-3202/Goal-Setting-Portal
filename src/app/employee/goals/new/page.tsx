'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import GoalSheetForm from '@/components/goals/GoalSheetForm'

function NewGoalContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const editId = searchParams.get('edit')

  const [defaultValues, setDefaultValues] = useState<any>(null)
  const [loading, setLoading] = useState(!!editId)
  const [cycleName, setCycleName] = useState<string>('')

  useEffect(() => {
    // Fetch active cycle name
    fetch('/api/cycles/active')
      .then((r) => r.json())
      .then((data) => setCycleName(data?.name ?? 'Current Cycle'))
      .catch(() => setCycleName('Current Cycle'))
  }, [])

  useEffect(() => {
    if (!editId) return
    fetch(`/api/goals/${editId}`)
      .then((r) => r.json())
      .then((data) => {
        setDefaultValues({ goals: data.goals })
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [editId])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <Loader2 size={32} color="#0d9488" style={{ margin: '0 auto 12px', display: 'block', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#4a7c6f', fontSize: '14px', fontFamily: 'Georgia, serif' }}>Loading goal sheet…</p>
      </div>
    )
  }

  return (
    <div style={{ background: '#f0faf8', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>

      {/* Decorative blob */}
      <div style={{
        background: 'radial-gradient(circle, rgba(13,148,136,0.1) 0%, transparent 70%)',
        position: 'fixed', top: 0, right: 0,
        width: '400px', height: '400px',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>

        {/* Back button */}
        <button
          onClick={() => router.push('/goals')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', color: '#4a7c6f',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            marginBottom: '24px', fontFamily: 'Georgia, serif',
            padding: 0,
          }}
        >
          <ArrowLeft size={15} /> Back to My Goals
        </button>

        {/* Header card */}
        <div style={{
          background: 'white', borderRadius: '24px',
          border: '1px solid #c9ebe4',
          boxShadow: '0 4px 24px rgba(13,148,136,0.07)',
          padding: '28px 30px', marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '6px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
              borderRadius: '14px', padding: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 style={{ color: '#0f4c3a', fontWeight: 800, fontSize: '24px', margin: 0 }}>
                {editId ? 'Edit Goal Sheet' : 'New Goal Sheet'}
              </h1>
              <p style={{ color: '#4a7c6f', fontSize: '13px', margin: '3px 0 0' }}>
                Cycle: <strong style={{ color: '#0f4c3a' }}>{cycleName}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Rules reminder */}
        <div style={{
          background: '#fffbeb', border: '1px solid #fde68a',
          borderRadius: '14px', padding: '14px 18px', marginBottom: '20px',
          display: 'flex', gap: '12px', alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '18px', flexShrink: 0, marginTop: '1px' }}>📋</span>
          <div>
            <p style={{ color: '#92400e', fontWeight: 700, fontSize: '13px', margin: '0 0 4px' }}>
              Goal Sheet Rules
            </p>
            <ul style={{ color: '#92400e', fontSize: '12px', margin: 0, paddingLeft: '16px', lineHeight: 1.7 }}>
              <li>Maximum <strong>8 goals</strong> per sheet</li>
              <li>Minimum <strong>10% weightage</strong> per goal</li>
              <li>Total weightage must equal exactly <strong>100%</strong></li>
              <li>Goals are <strong>locked</strong> after manager approval</li>
            </ul>
          </div>
        </div>

        {/* Main form card */}
        <div style={{
          background: 'white', borderRadius: '24px',
          border: '1px solid #c9ebe4',
          boxShadow: '0 4px 24px rgba(13,148,136,0.07)',
          padding: '28px 30px',
        }}>
          <GoalSheetForm
            defaultValues={defaultValues}
            goalSheetId={editId ?? undefined}
            isEdit={!!editId}
          />
        </div>
      </div>
    </div>
  )
}

export default function NewGoalPage() {
  return (
    <Suspense fallback={
      <div style={{ textAlign: 'center', padding: '100px 20px', fontFamily: 'Georgia, serif' }}>
        <Loader2 size={32} color="#0d9488" style={{ margin: '0 auto 12px', display: 'block' }} />
        <p style={{ color: '#4a7c6f' }}>Loading…</p>
      </div>
    }>
      <NewGoalContent />
    </Suspense>
  )
}