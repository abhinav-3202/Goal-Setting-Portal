  'use client'

import { useFieldArray, useForm, FormProvider, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Loader2, Send } from 'lucide-react'
import GoalRow from './GoalRow'
import WeightageBar from './WeightageBar'

const goalSchema = z.object({
  thrustArea: z.string().min(1, 'Thrust area is required'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  uom: z
    .enum([
      'numeric_min',
      'numeric_max',
      'timeline',
      'zero-based',
    ])
    .refine(Boolean, {
      message: 'Select a UoM type',
    }),
  target: z.string().min(1, 'Target is required'),
  weightage: z
    .number()
    .min(10, 'Minimum weightage is 10%')
    .max(100, 'Maximum is 100%'),
  isShared: z.boolean().optional(),
})

const formSchema = z.object({
  goals: z
    .array(goalSchema)
    .min(1, 'Add at least one goal')
    .max(8, 'Maximum 8 goals allowed')
    .refine(
      (goals) =>
        goals.reduce((sum, g) => sum + (g.weightage || 0), 0) === 100,
      {
        message: 'Total weightage must equal 100%',
        path: ['root'],
      }
    ),
})

export type FormValues = z.infer<typeof formSchema>

interface GoalSheetFormProps {
  defaultValues?: FormValues
  cycleId?: string
  goalSheetId?: string
  isEdit?: boolean
}

export default function GoalSheetForm({
  defaultValues,
  cycleId,
  goalSheetId,
  isEdit = false,
}: GoalSheetFormProps) {
  const router = useRouter()

  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),

    defaultValues: defaultValues ?? {
      goals: [
        {
          thrustArea: '',
          title: '',
          description: '',
          uom: 'numeric_min',
          target: '',
          weightage: 10,
          isShared: false,
        },
      ],
    },

    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'goals',
  })

  const goals = form.watch('goals')

  const totalWeightage = goals.reduce(
    (sum, g) =>
      sum +
      (typeof g?.weightage === 'number'
        ? g.weightage
        : Number(g?.weightage) || 0),
    0
  )

  const canAddMore = fields.length < 8

  // SAVE DRAFT
  const handleSaveDraft = async () => {
    const values = form.getValues()

    setIsSaving(true)

    try {
      const url = isEdit
        ? `/api/goals/${goalSheetId}`
        : '/api/goals'

      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cycleId,
          goals: values.goals,
          status: 'draft',
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to save')
      }

      toast.success('Draft saved successfully')

      if (!isEdit) {
        const data = await res.json()
        router.replace(`/goals/${data._id}`)
      }
    } catch {
      toast.error('Failed to save draft')
    } finally {
      setIsSaving(false)
    }
  }

  // SUBMIT
  const handleSubmit: SubmitHandler<FormValues> = async (values) => {
    if (totalWeightage !== 100) {
      toast.error('Total weightage must equal exactly 100%')
      return
    }

    setIsSubmitting(true)

    try {
      const saveUrl = isEdit
        ? `/api/goals/${goalSheetId}`
        : '/api/goals'

      const saveRes = await fetch(saveUrl, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cycleId,
          goals: values.goals,
        }),
      })

      if (!saveRes.ok) {
        throw new Error('Failed to save')
      }

      const saved = await saveRes.json()

      const submitRes = await fetch('/api/goals/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goalSheetId: saved._id,
        }),
      })

      if (!submitRes.ok) {
        const err = await submitRes.json()
        throw new Error(err.message || 'Submit failed')
      }

      toast.success('Goals submitted for manager approval!')

      router.push('/goals')
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormProvider {...form}>
      <div style={{ fontFamily: 'Georgia, serif' }}>
        {/* Weightage */}
        <WeightageBar total={totalWeightage} />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            marginTop: '4px',
          }}
        >
          <span
            style={{
              color: '#4a7c6f',
              fontSize: '13px',
            }}
          >
            {fields.length} / 8 goals added
          </span>

          <button
            type="button"
            onClick={() =>
              append({
                thrustArea: '',
                title: '',
                description: '',
                uom: 'numeric_min',
                target: '',
                weightage: 10,
                isShared: false,
              })
            }
            disabled={!canAddMore}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: canAddMore
                ? 'linear-gradient(135deg, #0d9488, #06b6d4)'
                : '#e2e8f0',
              color: canAddMore ? 'white' : '#94a3b8',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: canAddMore ? 'pointer' : 'not-allowed',
            }}
          >
            <Plus size={14} />
            Add Goal
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          {fields.map((field, index) => (
            <GoalRow
              key={field.id}
              index={index}
              onRemove={() => remove(index)}
              canRemove={fields.length > 1}
              isShared={goals[index]?.isShared}
            />
          ))}

          {/* Weightage Error */}
          {form.formState.errors.goals?.root && (
            <p
              style={{
                color: '#e11d48',
                fontSize: '13px',
                marginBottom: '12px',
                textAlign: 'center',
              }}
            >
              {form.formState.errors.goals.root.message}
            </p>
          )}

          {/* Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '8px',
            }}
          >
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSaving}
              style={{
                flex: 1,
                padding: '12px',
                border: '1.5px solid #c9ebe4',
                borderRadius: '12px',
                background: 'white',
                color: '#0f4c3a',
                fontWeight: 700,
                fontSize: '14px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving…
                </>
              ) : (
                'Save Draft'
              )}
            </button>

            <button
              type="submit"
              disabled={isSubmitting || totalWeightage !== 100}
              style={{
                flex: 2,
                padding: '12px',
                background:
                  isSubmitting || totalWeightage !== 100
                    ? '#99f6e4'
                    : 'linear-gradient(135deg, #0d9488, #06b6d4)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontWeight: 700,
                fontSize: '14px',
                cursor:
                  isSubmitting || totalWeightage !== 100
                    ? 'not-allowed'
                    : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Send size={14} />
                  Submit for Approval
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </FormProvider>
  )
}