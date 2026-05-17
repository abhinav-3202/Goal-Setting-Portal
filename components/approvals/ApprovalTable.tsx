'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCircle, Loader2, RotateCcw } from 'lucide-react'
import InlineEditCell from './InlineEditCell'
import ReturnModal from './ReturnModal'

interface Goal {
  _id: string
  thrustArea: string
  title: string
  description?: string
  uom: string
  target: string | number
  weightage: number
  isShared?: boolean
}

interface ApprovalTableProps {
  goalSheetId: string
  employeeName: string
  goals: Goal[]
}

const UOM_LABELS: Record<string, string> = {
  min: 'Higher Better',
  max: 'Lower Better',
  timeline: 'Timeline',
  zero: 'Zero-based',
}

export default function ApprovalTable({ goalSheetId, employeeName, goals: initialGoals }: ApprovalTableProps) {
  const router = useRouter()
  const [goals, setGoals] = useState<Goal[]>(initialGoals)
  const [isApproving, setIsApproving] = useState(false)
  const [returnModalOpen, setReturnModalOpen] = useState(false)

  const totalWeightage = goals.reduce((sum, g) => sum + Number(g.weightage), 0)
  const weightageOk = totalWeightage === 100

  const updateGoal = (index: number, field: keyof Goal, value: string | number) => {
    setGoals((prev) => prev.map((g, i) => (i === index ? { ...g, [field]: value } : g)))
  }

  const handleApprove = async () => {
    if (!weightageOk) {
      toast.error('Total weightage must equal 100% before approving')
      return
    }
    setIsApproving(true)
    try {
      const res = await fetch(`/api/approvals/${goalSheetId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goals }),
      })
      if (!res.ok) throw new Error('Approval failed')
      toast.success(`Goals approved and locked for ${employeeName}`)
      router.push('/approvals')
    } catch {
      toast.error('Failed to approve. Please try again.')
    } finally {
      setIsApproving(false)
    }
  }

  const handleReturn = async (comment: string) => {
    const res = await fetch(`/api/approvals/${goalSheetId}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment }),
    })
    if (!res.ok) throw new Error('Return failed')
    toast.success(`Goals returned to ${employeeName} for revision`)
    setReturnModalOpen(false)
    router.push('/approvals')
  }

  return (
    <div style={{ fontFamily: 'Georgia, serif' }}>

      {/* Weightage warning */}
      {!weightageOk && (
        <div style={{
          background: '#fffbeb', border: '1px solid #fde68a',
          borderRadius: '12px', padding: '12px 16px', marginBottom: '16px',
        }}>
          <p style={{ color: '#92400e', fontSize: '13px', fontWeight: 600, margin: 0 }}>
            ⚠ Total weightage is {totalWeightage}% — must equal 100% to approve.
            Click any weightage cell to edit inline.
          </p>
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid #c9ebe4', marginBottom: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'linear-gradient(135deg, #0d9488, #06b6d4)' }}>
              {['#', 'Thrust Area', 'Goal Title', 'UoM', 'Target', 'Weightage %'].map((h) => (
                <th key={h} style={{
                  padding: '12px 14px', color: 'white',
                  fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap',
                  fontSize: '12px',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {goals.map((goal, index) => (
              <tr
                key={goal._id}
                style={{
                  background: index % 2 === 0 ? 'white' : '#f8fffe',
                  borderTop: '1px solid #e8f4f1',
                }}
              >
                <td style={{ padding: '12px 14px', color: '#4a7c6f', fontWeight: 600 }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
                    color: 'white', borderRadius: '50%',
                    width: '24px', height: '24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 700,
                  }}>
                    {index + 1}
                  </div>
                </td>
                <td style={{ padding: '12px 14px', color: '#0f4c3a' }}>
                  {goal.thrustArea}
                  {goal.isShared && (
                    <span style={{
                      marginLeft: '6px', background: '#ccfbf1', color: '#0d9488',
                      fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '20px',
                    }}>
                      SHARED
                    </span>
                  )}
                </td>
                <td style={{ padding: '12px 14px', color: '#0f4c3a', maxWidth: '220px' }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>{goal.title}</p>
                  {goal.description && (
                    <p style={{ margin: '2px 0 0', color: '#4a7c6f', fontSize: '12px' }}>{goal.description}</p>
                  )}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{
                    background: '#f0fdf9', color: '#0d9488',
                    border: '1px solid #99f6e4', borderRadius: '999px',
                    padding: '3px 10px', fontSize: '11px', fontWeight: 600,
                  }}>
                    {UOM_LABELS[goal.uom] ?? goal.uom}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  {goal.isShared ? (
                    <span style={{ color: '#0f4c3a', fontWeight: 600 }}>{goal.target}</span>
                  ) : (
                    <InlineEditCell
                      value={goal.target}
                      type={goal.uom === 'timeline' ? 'date' : 'number'}
                      onSave={(val) => updateGoal(index, 'target', val)}
                    />
                  )}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <InlineEditCell
                    value={goal.weightage}
                    type="number"
                    min={10}
                    max={100}
                    onSave={(val) => updateGoal(index, 'weightage', val)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: '#f0fdf9', borderTop: '2px solid #c9ebe4' }}>
              <td colSpan={5} style={{ padding: '12px 14px', color: '#0f4c3a', fontWeight: 700, fontSize: '13px' }}>
                Total Weightage
              </td>
              <td style={{ padding: '12px 14px' }}>
                <span style={{
                  fontWeight: 800, fontSize: '15px',
                  color: weightageOk ? '#0d9488' : '#e11d48',
                }}>
                  {totalWeightage}%
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => setReturnModalOpen(true)}
          style={{
            flex: 1, padding: '12px',
            border: '1.5px solid #fecdd3', borderRadius: '12px',
            background: 'white', color: '#e11d48', fontWeight: 700, fontSize: '14px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          <RotateCcw size={14} /> Return for Rework
        </button>

        <button
          onClick={handleApprove}
          disabled={isApproving || !weightageOk}
          style={{
            flex: 2, padding: '12px',
            background: isApproving || !weightageOk
              ? '#99f6e4'
              : 'linear-gradient(135deg, #0d9488, #06b6d4)',
            border: 'none', borderRadius: '12px',
            color: 'white', fontWeight: 700, fontSize: '14px',
            cursor: isApproving || !weightageOk ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'opacity 0.2s',
          }}
        >
          {isApproving
            ? <><Loader2 size={14} className="animate-spin" /> Approving…</>
            : <><CheckCircle size={14} /> Approve & Lock Goals</>}
        </button>
      </div>

      <ReturnModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        onConfirm={handleReturn}
        employeeName={employeeName}
      />
    </div>
  )
}