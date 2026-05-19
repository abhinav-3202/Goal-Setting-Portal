import { IEscalationRule } from '@/src/models/EscalationRule';
import { ICheckIn } from '@/src/models/CheckIn';
import { IGoal } from '@/src/models/Goal';
import { computeScore } from '@/lib/scoreEngine';

/**
 * EscalationEngine
 * Evaluates check-ins against escalation rules and determines if escalation is needed
 */

export interface EscalationCheckResult {
  isEscalated: boolean;
  rule?: IEscalationRule;
  reason: string;
  actualValue: number;
}

/**
 * Check if a check-in value meets escalation criteria
 * @param rule - The escalation rule to check against
 * @param checkIn - The check-in to evaluate
 * @param goal - The associated goal (for context)
 * @returns Whether escalation should be triggered
 */
export function checkEscalationCondition(
  rule: IEscalationRule,
  checkIn: ICheckIn,
  goal: IGoal
): EscalationCheckResult {
  const { condition } = rule;
  let actualValue = 0;
  let checkResult = false;

  switch (condition.field) {
    case 'actual':
      // Check the actual value from check-in
      actualValue = Number(checkIn.actual) || 0;
      checkResult = compareValues(actualValue, condition.operator, condition.value);
      break;

    case 'target':
      // Check if actual is below/above target
      actualValue = Number(checkIn.actual) || 0;
      const target = Number(goal.target) || 0;
      checkResult = compareValues(actualValue, condition.operator, target);
      break;

    case 'progress':
      // Progress = actual/target percentage
      const prog = ((Number(checkIn.actual) || 0) / (Number(goal.target) || 1)) * 100;
      actualValue = prog;
      checkResult = compareValues(prog, condition.operator, condition.value);
      break;

    case 'weightage':
      // Check goal weightage
      actualValue = Number(goal.weightage) || 0;
      checkResult = compareValues(actualValue, condition.operator, condition.value);
      break;
  }

  return {
    isEscalated: checkResult,
    rule: checkResult ? rule : undefined,
    reason: checkResult
      ? `${condition.field} ${condition.operator} ${condition.value}: ${actualValue.toFixed(2)}`
      : '',
    actualValue
  };
}

/**
 * Compare two values based on operator
 */
function compareValues(actual: number, operator: '<' | '>' | '=' | '!=', threshold: number): boolean {
  switch (operator) {
    case '<':
      return actual < threshold;
    case '>':
      return actual > threshold;
    case '=':
      return actual === threshold;
    case '!=':
      return actual !== threshold;
    default:
      return false;
  }
}

/**
 * Determine escalation severity (for future use in notifications)
 */
export function getEscalationSeverity(rule: IEscalationRule): 'low' | 'medium' | 'high' {
  // Rules involving progress < 50% are high severity
  if (rule.condition.field === 'progress' && rule.condition.operator === '<' && rule.condition.value >= 50) {
    return 'high';
  }
  // Rules involving actual values are medium
  if (rule.condition.field === 'actual' || rule.condition.field === 'target') {
    return 'medium';
  }
  // Default to low
  return 'low';
}
