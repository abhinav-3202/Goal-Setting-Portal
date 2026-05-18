import dbConnect from '@/src/lib/dbConnect'
import {Cycle} from '@/src/models/Cycle'

export type CyclePhase = 'goal_setting' | 'Q1' | 'Q2' | 'Q3' | 'Q4'

export interface ActiveCycleInfo {
  _id: string
  name: string
  phase: CyclePhase
  activeQuarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  openDate: Date
  closeDate: Date
  isActive: boolean
}

/**
 * Returns the currently active cycle document, or null if no window is open.
 * Call this at the top of every write API route in Phase 1 and Phase 2.
 */
export async function getActiveCycle(): Promise<ActiveCycleInfo | null> {
  await dbConnect()
  const now = new Date()

  const cycle = await Cycle.findOne({
    isActive: true,
    openDate: { $lte: now },
    closeDate: { $gte: now },
  }).lean()

  if (!cycle) return null
  return cycle as unknown as ActiveCycleInfo
}

/**
 * Returns true if the goal-setting window is currently open.
 * Used by: POST /api/goals, PATCH /api/goals/[id]
 */
export async function isGoalSettingOpen(): Promise<boolean> {
  const cycle = await getActiveCycle()
  return cycle?.phase === 'goal_setting'
}

/**
 * Returns true if a specific quarter check-in window is open.
 * Used by: POST /api/check-ins, PATCH /api/check-ins/[id]
 */
export async function isCheckInWindowOpen(quarter: string): Promise<boolean> {
  const cycle = await getActiveCycle()
  if (!cycle) return false
  return cycle.activeQuarter === quarter
}

/**
 * Throws a 403-ready error object if the goal-setting window is closed.
 * Use with try/catch in route handlers.
 */
export async function assertGoalSettingOpen(): Promise<void> {
  const open = await isGoalSettingOpen()
  if (!open) {
    throw new Error('WINDOW_CLOSED: Goal setting window is not currently open.')
  }
}

/**
 * Throws a 403-ready error object if the check-in window for the given quarter is closed.
 */
export async function assertCheckInWindowOpen(quarter: string): Promise<void> {
  const open = await isCheckInWindowOpen(quarter)
  if (!open) {
    throw new Error(`WINDOW_CLOSED: Check-in window for ${quarter} is not currently open.`)
  }
}