export function computeScore(
  uom: string,
  target: number,
  actual: number,
  deadline?: Date,
  completionDate?: Date
): number {
  if (uom === 'min') {
    // Higher is better — e.g. Sales Revenue
    if (target === 0) return 0
    return Math.min(actual / target, 2) // cap at 200% to avoid infinity
  }

  if (uom === 'max') {
    // Lower is better — e.g. TAT, Cost
    if (actual === 0) return 1 // perfect score
    return Math.min(target / actual, 2)
  }

  if (uom === 'zero') {
    // Zero = success — e.g. Safety incidents
    return actual === 0 ? 1 : 0
  }

  if (uom === 'timeline') {
    // Date-based completion
    if (!deadline || !completionDate) return 0
    return completionDate <= deadline ? 1 : 0
  }

  return 0
}

export function scoreToPercent(score: number): number {
  return Math.min(Math.round(score * 100), 100)
}

export function scoreLabel(score: number): string {
  const pct = scoreToPercent(score)
  if (pct >= 90) return 'Excellent'
  if (pct >= 70) return 'On Track'
  if (pct >= 50) return 'At Risk'
  return 'Below Target'
}