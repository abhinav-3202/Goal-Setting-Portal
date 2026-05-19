/**
 * Analytics Aggregation
 * Helpers for calculating analytics metrics and aggregations
 */

import { Goal } from '@/src/models/Goal';
import { CheckIn } from '@/src/models/CheckIn';
import { Cycle } from '@/src/models/Cycle';
import { UserModel } from '@/src/models/User';
import { Types } from 'mongoose';

export interface GoalMetrics {
  totalGoals: number;
  approvedGoals: number;
  lockedGoals: number;
  submittedGoals: number;
  draftGoals: number;
  averageWeightage: number;
  completionRate: number;
}

export interface TeamMetrics {
  totalEmployees: number;
  employeesWithSubmittedGoals: number;
  employeesWithApprovedGoals: number;
  averageGoalsPerEmployee: number;
  averageScore: number;
}

export interface QuarterlyMetrics {
  quarter: string;
  checkInsSubmitted: number;
  checkInsPending: number;
  averageProgress: number;
  averageScore: number;
  onTrackCount: number;
  atRiskCount: number;
  completedCount: number;
}

/**
 * Get aggregated metrics for a user's goals
 */
export async function getUserGoalMetrics(userId: string, cycleId?: string): Promise<GoalMetrics> {
  const query: any = { employeeId: new Types.ObjectId(userId) };
  if (cycleId) {
    query.cycleId = new Types.ObjectId(cycleId);
  }

  const goals = await Goal.find(query);

  const totalGoals = goals.length;
  const approvedGoals = goals.filter(g => g.status === 'approved').length;
  const lockedGoals = goals.filter(g => g.status === 'locked').length;
  const submittedGoals = goals.filter(g => g.status === 'submitted').length;
  const draftGoals = goals.filter(g => g.status === 'draft').length;

  const averageWeightage = totalGoals > 0 ? (goals.reduce((sum, g) => sum + g.weightage, 0) / totalGoals) : 0;

  // Completion rate = (approved + locked) / total
  const completionRate = totalGoals > 0 ? ((approvedGoals + lockedGoals) / totalGoals) * 100 : 0;

  return {
    totalGoals,
    approvedGoals,
    lockedGoals,
    submittedGoals,
    draftGoals,
    averageWeightage: Number(averageWeightage.toFixed(2)),
    completionRate: Number(completionRate.toFixed(2))
  };
}

/**
 * Get aggregated metrics for a manager's team
 */
export async function getTeamMetrics(managerId: string, cycleId?: string): Promise<TeamMetrics> {
  // Get all employees managed by this manager
  const employees = await UserModel.find({
    managerId: new Types.ObjectId(managerId),
    role: 'employee'
  }).select('_id');

  const employeeIds = employees.map(e => e._id);
  const totalEmployees = employeeIds.length;

  const query: any = { employeeId: { $in: employeeIds } };
  if (cycleId) {
    query.cycleId = new Types.ObjectId(cycleId);
  }

  const goals = await Goal.find(query);
  const checkIns = await CheckIn.find(query);

  // Employees with submitted/approved goals
  const employeesWithSubmitted = new Set(
    goals.filter(g => g.status === 'submitted').map(g => g.employeeId.toString())
  ).size;

  const employeesWithApproved = new Set(
    goals.filter(g => g.status === 'approved' || g.status === 'locked').map(g => g.employeeId.toString())
  ).size;

  const averageGoalsPerEmployee = totalEmployees > 0 ? goals.length / totalEmployees : 0;
  const averageScore = checkIns.length > 0
    ? (checkIns.reduce((sum, c) => sum + c.computedScore, 0) / checkIns.length)
    : 0;

  return {
    totalEmployees,
    employeesWithSubmittedGoals: employeesWithSubmitted,
    employeesWithApprovedGoals: employeesWithApproved,
    averageGoalsPerEmployee: Number(averageGoalsPerEmployee.toFixed(2)),
    averageScore: Number(averageScore.toFixed(2))
  };
}

/**
 * Get quarterly check-in metrics
 */
export async function getQuarterlyMetrics(
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4',
  cycleId?: string
): Promise<QuarterlyMetrics> {
  const query: any = { quarter };
  if (cycleId) {
    query.cycleId = new Types.ObjectId(cycleId);
  }

  const checkIns = await CheckIn.find(query);

  const submitted = checkIns.filter(c => c.status === 'submitted').length;
  const pending = checkIns.filter(c => c.status !== 'submitted').length;

  // Calculate progress
  const totalActual = checkIns.reduce((sum, c) => sum + (Number(c.actual) || 0), 0);
  const averageProgress = checkIns.length > 0 ? (totalActual / checkIns.length) : 0;

  const averageScore = checkIns.length > 0
    ? (checkIns.reduce((sum, c) => sum + c.computedScore, 0) / checkIns.length)
    : 0;

  const onTrack = checkIns.filter(c => c.statusTag === 'on_track').length;
  const atRisk = checkIns.filter(c => c.statusTag === 'not_started').length;
  const completed = checkIns.filter(c => c.statusTag === 'completed').length;

  return {
    quarter,
    checkInsSubmitted: submitted,
    checkInsPending: pending,
    averageProgress: Number(averageProgress.toFixed(2)),
    averageScore: Number(averageScore.toFixed(2)),
    onTrackCount: onTrack,
    atRiskCount: atRisk,
    completedCount: completed
  };
}

/**
 * Get goal distribution by thrust area
 */
export async function getGoalDistributionByThrustArea(cycleId?: string) {
  const query: any = {};
  if (cycleId) {
    query.cycleId = new Types.ObjectId(cycleId);
  }

  const goals = await Goal.find(query);
  const distribution: { [key: string]: number } = {};

  goals.forEach(goal => {
    const area = goal.thrustArea || 'Unspecified';
    distribution[area] = (distribution[area] || 0) + 1;
  });

  return distribution;
}

/**
 * Get goal distribution by status
 */
export async function getGoalDistributionByStatus(cycleId?: string) {
  const query: any = {};
  if (cycleId) {
    query.cycleId = new Types.ObjectId(cycleId);
  }

  const goals = await Goal.find(query);
  const distribution = {
    draft: 0,
    submitted: 0,
    approved: 0,
    locked: 0
  };

  goals.forEach(goal => {
    if (goal.status in distribution) {
      (distribution as any)[goal.status]++;
    }
  });

  return distribution;
}

/**
 * Get score distribution (histogram)
 */
export async function getScoreDistribution(cycleId?: string, quarter?: string) {
  const query: any = {};
  if (cycleId) {
    query.cycleId = new Types.ObjectId(cycleId);
  }
  if (quarter) {
    query.quarter = quarter;
  }

  const checkIns = await CheckIn.find(query);

  const bins = {
    '0-20': 0,
    '21-40': 0,
    '41-60': 0,
    '61-80': 0,
    '81-100': 0
  };

  checkIns.forEach(checkIn => {
    const score = Math.min(100, Math.max(0, checkIn.computedScore * 100));
    if (score <= 20) bins['0-20']++;
    else if (score <= 40) bins['21-40']++;
    else if (score <= 60) bins['41-60']++;
    else if (score <= 80) bins['61-80']++;
    else bins['81-100']++;
  });

  return bins;
}

/**
 * Get manager effectiveness metrics
 */
export async function getManagerEffectivenessMetrics(managerId: string) {
  const employees = await UserModel.find({
    managerId: new Types.ObjectId(managerId),
    role: 'employee'
  }).select('_id');

  const employeeIds = employees.map(e => e._id);

  // Goals submitted by team
  const goalsSubmitted = await Goal.countDocuments({
    employeeId: { $in: employeeIds },
    status: { $in: ['submitted', 'approved', 'locked'] }
  });

  // Check-ins submitted
  const checkInsSubmitted = await CheckIn.countDocuments({
    employeeId: { $in: employeeIds },
    status: 'submitted'
  });

  // Team average score
  const teamCheckIns = await CheckIn.find({
    employeeId: { $in: employeeIds }
  });

  const averageTeamScore = teamCheckIns.length > 0
    ? (teamCheckIns.reduce((sum, c) => sum + c.computedScore, 0) / teamCheckIns.length) * 100
    : 0;

  return {
    teamSize: employees.length,
    goalsSubmitted,
    checkInsSubmitted,
    averageTeamScore: Number(averageTeamScore.toFixed(2)),
    teamEngagementRate: employees.length > 0 ? (checkInsSubmitted / employees.length) * 100 : 0
  };
}
