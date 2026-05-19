import { EscalationRule } from '@/src/models/EscalationRule';
import { EscalationLog } from '@/src/models/EscalationLog';
import { Goal } from '@/src/models/Goal';
import { CheckIn } from '@/src/models/CheckIn';
import { checkEscalationCondition, getEscalationSeverity } from './escalationEngine';
import { Types } from 'mongoose';

/**
 * RuleChecker
 * Applies all active escalation rules to check-ins and creates escalation logs
 */

export interface CheckRulesResult {
  escalated: boolean;
  escalationLogId?: string;
  message: string;
}

/**
 * Check all active rules against a check-in
 * Creates escalation log if any rule triggers
 */
export async function checkRulesForCheckIn(
  checkInId: string,
  employeeId: string,
  goalId: string
): Promise<CheckRulesResult> {
  try {
    // Fetch the check-in, goal, and employee
    const checkIn = await CheckIn.findById(checkInId).populate('goalId');
    if (!checkIn) {
      return { escalated: false, message: 'Check-in not found' };
    }

    const goal = await Goal.findById(goalId);
    if (!goal) {
      return { escalated: false, message: 'Goal not found' };
    }

    const employee = await (await import('@/src/models/User')).UserModel.findById(employeeId);
    if (!employee || !employee.managerId) {
      return { escalated: false, message: 'Employee or manager not found' };
    }

    // Get all active escalation rules
    const activeRules = await EscalationRule.find({ isActive: true });

    // Check each rule
    for (const rule of activeRules) {
      const result = checkEscalationCondition(rule, checkIn, goal);

      if (result.isEscalated) {
        // Create escalation log
        const escalationLog = await EscalationLog.create({
          ruleId: rule._id,
          goalId: goal._id,
          employeeId: new Types.ObjectId(employeeId),
          managerId: employee.managerId,
          reason: result.reason,
          actualValue: result.actualValue,
          status: 'pending'
        });

        return {
          escalated: true,
          escalationLogId: escalationLog._id.toString(),
          message: `Escalation triggered: ${result.reason}`
        };
      }
    }

    return { escalated: false, message: 'No rules triggered' };
  } catch (error) {
    console.error('Error checking rules:', error);
    throw error;
  }
}

/**
 * Acknowledge an escalation (manager action)
 */
export async function acknowledgeEscalation(escalationLogId: string): Promise<boolean> {
  try {
    const result = await EscalationLog.findByIdAndUpdate(
      escalationLogId,
      {
        status: 'acknowledged',
        acknowledgedAt: new Date()
      }
    );
    return !!result;
  } catch (error) {
    console.error('Error acknowledging escalation:', error);
    throw error;
  }
}

/**
 * Resolve an escalation with notes
 */
export async function resolveEscalation(
  escalationLogId: string,
  resolutionNotes: string
): Promise<boolean> {
  try {
    if (!resolutionNotes || resolutionNotes.trim().length === 0) {
      throw new Error('Resolution notes are required');
    }

    const result = await EscalationLog.findByIdAndUpdate(
      escalationLogId,
      {
        status: 'resolved',
        resolvedAt: new Date(),
        resolutionNotes
      }
    );
    return !!result;
  } catch (error) {
    console.error('Error resolving escalation:', error);
    throw error;
  }
}

/**
 * Get escalations for a manager's team
 */
export async function getManagerEscalations(managerId: string, status?: string) {
  try {
    const query: any = { managerId };
    if (status) {
      query.status = status;
    }

    return await EscalationLog.find(query)
      .populate('ruleId', 'name description')
      .populate('goalId', 'title thrustArea')
      .populate('employeeId', 'name email')
      .sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error fetching manager escalations:', error);
    throw error;
  }
}
