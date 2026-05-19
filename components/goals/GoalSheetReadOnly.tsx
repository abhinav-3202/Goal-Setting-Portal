'use client'
import GoalStatusBadge from './GoalStatusBadge'
import { Lock, Calendar } from 'lucide-react'

interface Goal {
  _id: string
  thrustArea: string
  title: string
  description?: string
  uom: 'numeric_min' | 'numeric_max' | 'timeline' | 'zero-based'
  target: string
  weightage: number
  isShared?: boolean
}

interface GoalSheetReadOnlyProps {
  goals: Goal[]
  status: 'draft' | 'submitted' | 'approved' | 'locked'
  lockedAt?: string
  returnComment?: string
  employeeName?: string
  cycleName?: string
}

const UOM_LABELS: Record<string, string> = {
  numeric_min: 'Higher is Better',
  numeric_max: 'Lower is Better',
  timeline: 'Timeline',
  'zero-based': 'Zero-based',
}

export default function GoalSheetReadOnly({
  goals,
  status,
  lockedAt,
  returnComment,
  employeeName,
  cycleName,
}: GoalSheetReadOnlyProps) {
  return (
    <div style={{ fontFamily: 'Georgia, serif' }}>

      {/* Header info row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          {employeeName && (
            <p style={{ color: '#4a7c6f', fontSize: '13px', marginBottom: '4px' }}>Employee: <strong style={{ color: '#0f4c3a' }}>{employeeName}</strong></p>
          )}
          {cycleName && (
            <p style={{ color: '#4a7c6f', fontSize: '13px' }}>Cycle: <strong style={{ color: '#0f4c3a' }}>{cycleName}</strong></p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <GoalStatusBadge status={status} />
          {lockedAt && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4a7c6f', fontSize: '12px' }}>
              <Lock size={12} />
              Locked {new Date(lockedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Return comment banner */}
      {returnComment && (
        <div style={{
          background: '#fff7ed', border: '1px solid #fed7aa',
          borderRadius: '12px', padding: '14px 18px', marginBottom: '18px',
        }}>
          <p style={{ color: '#9a3412', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>
            ⚠ Returned for Rework
          </p>
          <p style={{ color: '#9a3412', fontSize: '13px', margin: 0 }}>{returnComment}</p>
        </div>
      )}

      {/* Goals */}
      {goals.map((goal, index) => (
        <div
          key={goal._id}
          style={{
            background: goal.isShared ? '#f0fdf9' : 'white',
            border: goal.isShared ? '1.5px solid #0d9488' : '1px solid #c9ebe4',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
                color: 'white', borderRadius: '50%',
                width: '26px', height: '26px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 700, flexShrink: 0,
              }}>
                {index + 1}
              </div>
              <div>
                <h3 style={{ color: '#0f4c3a', fontWeight: 700, fontSize: '15px', margin: 0 }}>{goal.title}</h3>
                <span style={{ color: '#4a7c6f', fontSize: '12px' }}>{goal.thrustArea}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              {goal.isShared && (
                <span style={{ background: '#ccfbf1', color: '#0d9488', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>
                  SHARED
                </span>
              )}
              <span style={{ background: '#f0fdf9', color: '#0f4c3a', border: '1px solid #c9ebe4', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>
                {goal.weightage}%
              </span>
            </div>
          </div>

          {goal.description && (
            <p style={{ color: '#4a7c6f', fontSize: '13px', marginBottom: '12px', lineHeight: 1.5 }}>{goal.description}</p>
          )}

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '8px 14px' }}>
              <span style={{ color: '#64748b', fontSize: '11px', display: 'block', marginBottom: '2px' }}>UoM Type</span>
              <span style={{ color: '#0f4c3a', fontSize: '13px', fontWeight: 600 }}>{UOM_LABELS[goal.uom]}</span>
            </div>
            <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '8px 14px' }}>
              <span style={{ color: '#64748b', fontSize: '11px', display: 'block', marginBottom: '2px' }}>
                {goal.uom === 'timeline' ? 'Deadline' : 'Target'}
              </span>
              <span style={{ color: '#0f4c3a', fontSize: '13px', fontWeight: 600 }}>
                {goal.uom === 'timeline'
                  ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} />{new Date(goal.target).toLocaleDateString()}</span>
                  : goal.target}
              </span>
            </div>
          </div>
        </div>
      ))}

      {/* Locked footer */}
      {status === 'locked' && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          padding: '12px', background: '#eff6ff', borderRadius: '10px',
          color: '#1e40af', fontSize: '13px', fontWeight: 500,
        }}>
          <Lock size={13} />
          Goals are locked. Contact Admin for any changes.
        </div>
      )}
    </div>
  )
}