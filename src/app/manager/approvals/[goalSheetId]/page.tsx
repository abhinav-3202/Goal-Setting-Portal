'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, User } from 'lucide-react'
import ApprovalTable from '@/components/approvals/ApprovalTable'

interface GoalSheetData {
  _id: string
  employeeName: string
  employeeEmail: string
  department?: string
  cycleName: string
  submittedAt: string
  goalCount: number
  goals: any[]
}

export default function ManagerApprovalReviewPage() {
  const params = useParams()
  const router = useRouter()
  const goalSheetId = params.goalSheetId as string

  const [sheet, setSheet] = useState<GoalSheetData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/approvals/${goalSheetId}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then(setSheet)
      .catch(() => setError('Could not load this goal sheet.'))
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
        <div style={{ background: 'white', border: '1px solid #fecdd3', borderRadius: '20px', padding: '40px', textAlign: 'center', maxWidth: '400px' }}>
          <p style={{ color: '#e11d48', fontWeight: 700, marginBottom: '8px' }}>Something went wrong</p>
          <p style={{ color: '#4a7c6f', fontSize: '13px', marginBottom: '20px' }}>{error}</p>
          <button
            onClick={() => router.push('/approvals')}
            style={{ background: 'linear-gradient(135deg, #0d9488, #06b6d4)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 22px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Georgia, serif' }}
          >
            Back to Approvals
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

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>

        {/* Back */}
        <button
          onClick={() => router.push('/approvals')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#4a7c6f', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '24px', fontFamily: 'Georgia, serif', padding: 0 }}
        >
          <ArrowLeft size={15} /> Back to Approvals
        </button>

        {/* Employee header card */}
        <div style={{
          background: 'white', borderRadius: '24px', border: '1px solid #c9ebe4',
          boxShadow: '0 4px 24px rgba(13,148,136,0.07)',
          padding: '24px 28px', marginBottom: '18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
              color: 'white', borderRadius: '50%',
              width: '52px', height: '52px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', fontWeight: 700,
            }}>
              {sheet.employeeName.charAt(0).toUpperCase()}
            </div>

            <div style={{ flex: 1 }}>
              <h1 style={{ color: '#0f4c3a', fontWeight: 800, fontSize: '22px', margin: 0 }}>
                {sheet.employeeName}
              </h1>
              <p style={{ color: '#4a7c6f', fontSize: '13px', margin: '3px 0 0' }}>
                {sheet.employeeEmail}
                {sheet.department && <span> · {sheet.department}</span>}
              </p>
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ color: '#0f4c3a', fontWeight: 700, fontSize: '14px', margin: 0 }}>
                {sheet.cycleName}
              </p>
              <p style={{ color: '#4a7c6f', fontSize: '12px', margin: '3px 0 0' }}>
                Submitted {new Date(sheet.submittedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Info bar */}
          <div style={{
            marginTop: '16px', background: '#fffbeb',
            border: '1px solid #fde68a', borderRadius: '10px',
            padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ fontSize: '16px' }}>💡</span>
            <p style={{ color: '#92400e', fontSize: '13px', fontWeight: 500, margin: 0 }}>
              You can edit <strong>Target</strong> and <strong>Weightage</strong> inline before approving.
              Click any cell in those columns to edit. Total weightage must equal 100% to approve.
            </p>
          </div>
        </div>

        {/* Approval table card */}
        <div style={{
          background: 'white', borderRadius: '24px', border: '1px solid #c9ebe4',
          boxShadow: '0 4px 24px rgba(13,148,136,0.07)',
          padding: '24px 28px',
        }}>
          <h2 style={{ color: '#0f4c3a', fontWeight: 700, fontSize: '17px', marginBottom: '18px' }}>
            Goal Sheet — {sheet.goalCount} Goals
          </h2>
          <ApprovalTable
            goalSheetId={sheet._id}
            employeeName={sheet.employeeName}
            goals={sheet.goals}
          />
        </div>
      </div>
    </div>
  )
}