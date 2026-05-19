'use client'
import { useFormContext } from 'react-hook-form'
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import ScoreIndicator from './ScoreIndicator'
import { computeScore } from '@/lib/scoreEngine'

interface Goal {
  _id: string
  title: string
  thrustArea: string
  uom: 'numeric_min' | 'numeric_max' | 'timeline' | 'zero-based'
  target: string | number
  weightage: number
}

interface CheckInGoalRowProps {
  index: number
  goal: Goal
  readOnly?: boolean
}

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'on_track',    label: 'On Track' },
  { value: 'completed',   label: 'Completed' },
]

export default function CheckInGoalRow({ index, goal, readOnly = false }: CheckInGoalRowProps) {
  const form = useFormContext()

  const actual = form.watch(`goals.${index}.actual`)
  const score = actual !== '' && actual !== undefined
    ? computeScore(
        goal.uom,
        Number(goal.target),
        Number(actual),
        goal.uom === 'timeline' ? new Date(goal.target) : undefined,
        goal.uom === 'timeline' && actual ? new Date(actual as string) : undefined,
      )
    : null

  return (
    <div style={{
      background: 'white', border: '1px solid #c9ebe4',
      borderRadius: '16px', padding: '20px', marginBottom: '14px',
    }}>
      {/* Goal header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
            color: 'white', borderRadius: '50%',
            width: '26px', height: '26px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 700,
          }}>
            {index + 1}
          </div>
          <div>
            <h3 style={{ color: '#0f4c3a', fontWeight: 700, fontSize: '15px', margin: 0, fontFamily: 'Georgia, serif' }}>{goal.title}</h3>
            <span style={{ color: '#4a7c6f', fontSize: '12px' }}>{goal.thrustArea}</span>
          </div>
        </div>
        <span style={{
          background: '#f0fdf9', color: '#0f4c3a',
          border: '1px solid #c9ebe4', borderRadius: '999px',
          padding: '4px 10px', fontSize: '12px', fontWeight: 700,
          flexShrink: 0,
        }}>
          {goal.weightage}%
        </span>
      </div>

      {/* Target info bar */}
      <div style={{
        background: '#f8fafc', borderRadius: '10px',
        padding: '10px 14px', marginBottom: '14px',
        display: 'flex', gap: '20px', flexWrap: 'wrap',
      }}>
        <div>
          <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Planned Target</span>
          <span style={{ color: '#0f4c3a', fontWeight: 700, fontSize: '14px', fontFamily: 'Georgia, serif' }}>
            {goal.uom === 'timeline' ? new Date(goal.target).toLocaleDateString() : goal.target}
          </span>
        </div>
        <div>
          <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>UoM Type</span>
          <span style={{ color: '#0f4c3a', fontWeight: 600, fontSize: '13px' }}>
            {{ min: 'Higher Better', max: 'Lower Better', timeline: 'Timeline', zero: 'Zero-based' }[goal.uom]}
          </span>
        </div>
        <div>
          <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Live Score</span>
          <ScoreIndicator score={score} uom={goal.uom} />
        </div>
      </div>

      {/* Input row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <FormField
          control={form.control}
          name={`goals.${index}.actual`}
          render={({ field }) => (
            <FormItem>
              <FormLabel style={{ color: '#0f4c3a', fontWeight: 600, fontSize: '13px' }}>
                Actual Achievement {goal.uom === 'timeline' ? '(Date)' : ''}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={readOnly}
                  type={goal.uom === 'timeline' ? 'date' : 'number'}
                  placeholder={goal.uom === 'zero-based' ? '0 for success' : 'Enter actual value'}
                  style={{ borderColor: '#c9ebe4', color: '#0f4c3a', background: readOnly ? '#f8fafc' : 'white' }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`goals.${index}.statusTag`}
          render={({ field }) => (
            <FormItem>
              <FormLabel style={{ color: '#0f4c3a', fontWeight: 600, fontSize: '13px' }}>Status</FormLabel>
              <FormControl>
                <select
                  {...field}
                  disabled={readOnly}
                  style={{
                    width: '100%', padding: '9px 12px',
                    borderRadius: '10px', border: '1px solid #c9ebe4',
                    color: '#0f4c3a', fontSize: '13px',
                    background: readOnly ? '#f8fafc' : 'white',
                    outline: 'none', cursor: readOnly ? 'not-allowed' : 'pointer',
                  }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}