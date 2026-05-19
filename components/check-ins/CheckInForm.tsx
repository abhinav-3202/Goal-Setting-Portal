'use client'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import CheckInGoalRow from './CheckInGoalRow'
import QuarterSelector from './QuarterSelector'

type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4'

interface Goal {
  _id: string
  title: string
  thrustArea: string
  uom: 'numeric_min' | 'numeric_max' | 'timeline' | 'zero-based'
  target: string | number
  weightage: number
}

interface ExistingCheckIn {
  _id: string
  quarter: Quarter
  goals: Array<{ goalId: string; actual: string; statusTag: string }>
}

interface CheckInFormProps {
  goals: Goal[]
  goalSheetId: string
  activeQuarter: Quarter
  existingCheckIns: ExistingCheckIn[]
}

const goalEntrySchema = z.object({
  goalId: z.string(),
  actual: z.string().min(1, 'Enter actual value'),
  statusTag: z.enum(['not_started', 'on_track', 'completed']),
})

const formSchema = z.object({
  goals: z.array(goalEntrySchema),
})

type FormValues = z.infer<typeof formSchema>

export default function CheckInForm({ goals, goalSheetId, activeQuarter, existingCheckIns }: CheckInFormProps) {
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>(activeQuarter)
  const [isSaving, setIsSaving] = useState(false)
  const isReadOnly = selectedQuarter !== activeQuarter

  const existing = existingCheckIns.find((c) => c.quarter === selectedQuarter)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: {
      goals: goals.map((g) => {
        const found = existing?.goals.find((eg) => eg.goalId === g._id)
        return {
          goalId: g._id,
          actual: found?.actual ?? '',
          statusTag: (found?.statusTag as any) ?? 'not_started',
        }
      }),
    },
  })

  const onSubmit = async (values: FormValues) => {
    setIsSaving(true)
    try {
      const method = existing ? 'PATCH' : 'POST'
      const url = existing ? `/api/check-ins/${existing._id}` : '/api/check-ins'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalSheetId, quarter: selectedQuarter, goals: values.goals }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Save failed')
      }
      toast.success(`Q${selectedQuarter.replace('Q', '')} check-in saved successfully`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to save check-in')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <FormProvider {...form}>
      <div style={{ fontFamily: 'Georgia, serif' }}>

        <QuarterSelector
          active={selectedQuarter}
          activeQuarter={activeQuarter}
          onChange={setSelectedQuarter}
        />

        {/* Read-only notice for past quarters */}
        {isReadOnly && (
          <div style={{
            background: '#eff6ff', border: '1px solid #bfdbfe',
            borderRadius: '12px', padding: '12px 16px', marginBottom: '16px',
          }}>
            <p style={{ color: '#1e40af', fontSize: '13px', fontWeight: 500, margin: 0 }}>
              📋 Viewing {selectedQuarter} — {"this quarter's window is closed. Data is read-only."}
            </p>
          </div>
        )}

        {/* Window closed notice */}
        {!existing && !isReadOnly && (
          <div style={{
            background: '#f0fdf9', border: '1px solid #99f6e4',
            borderRadius: '12px', padding: '12px 16px', marginBottom: '16px',
          }}>
            <p style={{ color: '#0f4c3a', fontSize: '13px', fontWeight: 500, margin: 0 }}>
              ✏️ Enter your actual achievements for {selectedQuarter} below. You can update until the window closes.
            </p>
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)}>
          {goals.map((goal, index) => (
            <CheckInGoalRow
              key={goal._id}
              index={index}
              goal={goal}
              readOnly={isReadOnly}
            />
          ))}

          {!isReadOnly && (
            <button
              type="submit"
              disabled={isSaving}
              style={{
                width: '100%', padding: '13px',
                background: isSaving ? '#99f6e4' : 'linear-gradient(135deg, #0d9488, #06b6d4)',
                border: 'none', borderRadius: '12px',
                color: 'white', fontWeight: 700, fontSize: '15px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                marginTop: '8px', transition: 'opacity 0.2s',
              }}
            >
              {isSaving
                ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
                : <><Save size={16} /> Save {selectedQuarter} Check-in</>}
            </button>
          )}
        </form>
      </div>
    </FormProvider>
  )
}