/**
 * Returns true if the goal sheet can still be edited by the employee.
 * Only draft status allows edits.
 */
export function isGoalSheetEditable(status: string): boolean {
  return status === 'draft'
}

/**
 * Returns true if the goal sheet can be submitted.
 * Must be draft with valid weightage.
 */
export function canSubmitGoalSheet(
  status: string,
  goals: Array<{ weightage: number }>
): boolean {
  if (status !== 'draft') return false
  const total = goals.reduce((s, g) => s + Number(g.weightage), 0)
  return total === 100 && goals.length >= 1 && goals.length <= 8
}

/**
 * Returns true if manager can approve the sheet.
 */
export function canApprove(status: string): boolean {
  return status === 'submitted'
}

/**
 * Returns true if admin can unlock the goal sheet.
 */
export function canUnlock(status: string): boolean {
  return status === 'locked'
}

/**
 * Finds a goal inside a goals array by its _id string.
 */
export function findGoalById(
  goals: Array<{ _id: any; [key: string]: any }>,
  id: string
): Record<string, any> | undefined {
  return goals.find((g) => String(g._id) === id)
}

/**
 * Recalculates all scores for a check-in's goals array.
 * Requires scoreEngine — import separately to keep this file pure.
 */
export function buildAuditChanges(
  before: Record<string, any>,
  after: Record<string, any>,
  fields: string[]
): Array<{ field: string; old: string; new: string }> {
  const changes: Array<{ field: string; old: string; new: string }> = []
  for (const field of fields) {
    const oldVal = String(before[field] ?? '')
    const newVal = String(after[field] ?? '')
    if (oldVal !== newVal) {
      changes.push({ field, old: oldVal, new: newVal })
    }
  }
  return changes
}

/**
 * Returns a safe display label for a UoM type.
 */
export function uomLabel(uom: string): string {
  const map: Record<string, string> = {
    min: 'Higher is Better',
    max: 'Lower is Better',
    timeline: 'Timeline',
    zero: 'Zero-based',
  }
  return map[uom] ?? uom
}

/**
 * Returns the status colour hex for a goal sheet status.
 */
export function statusColor(status: string): string {
  const map: Record<string, string> = {
    draft: '#94a3b8',
    submitted: '#f59e0b',
    approved: '#0d9488',
    locked: '#3b82f6',
  }
  return map[status] ?? '#94a3b8'
}