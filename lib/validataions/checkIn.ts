import { z } from 'zod'

export const checkInGoalSchema = z.object({
  goalId: z.string().min(1, 'Goal ID is required'),
  actual: z.string().min(1, 'Actual achievement is required'),
  statusTag: z.enum(['not_started', 'on_track', 'completed'], {
    required_error: 'Status is required',
    invalid_type_error: 'Invalid status value',
  }),
})

export const checkInSchema = z.object({
  goalSheetId: z.string().min(1, 'Goal sheet ID is required'),
  quarter: z.enum(['Q1', 'Q2', 'Q3', 'Q4'], {
    required_error: 'Quarter is required',
    invalid_type_error: 'Quarter must be Q1, Q2, Q3, or Q4',
  }),
  goals: z
    .array(checkInGoalSchema)
    .min(1, 'At least one goal entry is required'),
})

export const checkInUpdateSchema = z.object({
  goals: z.array(checkInGoalSchema).min(1),
})

export type CheckInGoalInput = z.infer<typeof checkInGoalSchema>
export type CheckInInput = z.infer<typeof checkInSchema>

/**
 * Validates a check-in POST body and returns parsed result.
 */
export function parseCheckIn(body: unknown): {
  success: true; data: CheckInInput
} | {
  success: false; error: string
} {
  const result = checkInSchema.safeParse(body)
  if (result.success) return { success: true, data: result.data }

  const firstError = result.error.errors[0]
  return {
    success: false,
    error: firstError?.message ?? 'Invalid check-in data',
  }
}

/**
 * Validates a check-in PATCH body.
 */
export function parseCheckInUpdate(body: unknown): {
  success: true; data: { goals: CheckInGoalInput[] }
} | {
  success: false; error: string
} {
  const result = checkInUpdateSchema.safeParse(body)
  if (result.success) return { success: true, data: result.data }

  const firstError = result.error.errors[0]
  return {
    success: false,
    error: firstError?.message ?? 'Invalid check-in update data',
  }
}