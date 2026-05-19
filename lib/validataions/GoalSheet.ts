import { z } from 'zod'

export const goalSchema = z.object({
  thrustArea: z.string().min(1, 'Thrust area is required'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  uom: z
    .enum(['numeric_min', 'numeric_max', 'timeline', 'zero-based'])
    .refine(val => !!val, { message: 'Unit of measurement is required' }),
  target: z.string().min(1, 'Target is required'),
  weightage: z.coerce
    .number()
    .min(10, 'Minimum weightage per goal is 10%')
    .max(100, 'Weightage cannot exceed 100%'),
  isShared: z.boolean().optional().default(false),
  sharedFrom: z.string().optional(),
})

export const goalSheetSchema = z.object({
  goals: z
    .array(goalSchema)
    .min(1, 'At least one goal is required')
    .max(8, 'Maximum 8 goals allowed per sheet')
    .refine(
      (goals) => goals.reduce((sum, g) => sum + (g.weightage || 0), 0) === 100,
      { message: 'Total weightage across all goals must equal exactly 100%' }
    )
    .refine(
      (goals) => goals.every((g) => g.weightage >= 10),
      { message: 'Each individual goal must have a minimum weightage of 10%' }
    ),
})

export type GoalInput = z.infer<typeof goalSchema>
export type GoalSheetInput = z.infer<typeof goalSheetSchema>

/**
 * Validates a goal sheet payload and returns a parsed result.
 * Use in API route handlers.
 */
export function parseGoalSheet(body: unknown): {
  success: true; data: GoalSheetInput
} | {
  success: false; error: string
} {
  const result = goalSheetSchema.safeParse(body)
  if (result.success) return { success: true, data: result.data }

  const firstError = result.error.issues[0]
  return {
    success: false,
    error: firstError?.message ?? 'Invalid goal sheet data',
  }
}