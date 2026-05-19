/**
 * NotificationTemplates
 * Email templates for various notifications in the goal management system
 */

export interface NotificationData {
  [key: string]: string | number | boolean;
}

/**
 * Goal Submission Notification Template
 * Sent to manager when employee submits goals
 */
export function getGoalSubmissionTemplate(data: {
  employeeName: string;
  employeeEmail: string;
  goalCount: number;
  submissionDate: string;
  dashboardLink: string;
}): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Goal Submission Notification</h2>
        <p>Hi,</p>
        <p><strong>${data.employeeName}</strong> (${data.employeeEmail}) has submitted their goals for review.</p>
        <ul>
          <li><strong>Number of Goals:</strong> ${data.goalCount}</li>
          <li><strong>Submission Date:</strong> ${data.submissionDate}</li>
        </ul>
        <p>
          <a href="${data.dashboardLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Review Goals
          </a>
        </p>
        <p>Best regards,<br/>Goal Portal Team</p>
      </body>
    </html>
  `;
}

/**
 * Goal Approval Notification Template
 * Sent to employee when goals are approved
 */
export function getGoalApprovalTemplate(data: {
  employeeName: string;
  managerName: string;
  goalCount: number;
  approvalDate: string;
  dashboardLink: string;
}): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Goals Approved ✓</h2>
        <p>Hi ${data.employeeName},</p>
        <p>Great news! Your goals have been approved by <strong>${data.managerName}</strong>.</p>
        <ul>
          <li><strong>Number of Goals:</strong> ${data.goalCount}</li>
          <li><strong>Approval Date:</strong> ${data.approvalDate}</li>
        </ul>
        <p>You can now proceed with working towards your goals. Good luck!</p>
        <p>
          <a href="${data.dashboardLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Your Goals
          </a>
        </p>
        <p>Best regards,<br/>Goal Portal Team</p>
      </body>
    </html>
  `;
}

/**
 * Goal Return Notification Template
 * Sent to employee when goals are returned for revision
 */
export function getGoalReturnTemplate(data: {
  employeeName: string;
  managerName: string;
  returnComment: string;
  dashboardLink: string;
}): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Goals Returned for Revision</h2>
        <p>Hi ${data.employeeName},</p>
        <p><strong>${data.managerName}</strong> has returned your goals for revision with the following feedback:</p>
        <blockquote style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0;">
          ${data.returnComment}
        </blockquote>
        <p>Please review the feedback and update your goals accordingly.</p>
        <p>
          <a href="${data.dashboardLink}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Revise Goals
          </a>
        </p>
        <p>Best regards,<br/>Goal Portal Team</p>
      </body>
    </html>
  `;
}

/**
 * Check-in Submission Notification Template
 * Sent to manager when employee submits check-in
 */
export function getCheckInSubmissionTemplate(data: {
  employeeName: string;
  quarter: string;
  checkInDate: string;
  dashboardLink: string;
}): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Check-in Submission Notification</h2>
        <p>Hi,</p>
        <p><strong>${data.employeeName}</strong> has submitted their <strong>${data.quarter}</strong> check-in.</p>
        <ul>
          <li><strong>Quarter:</strong> ${data.quarter}</li>
          <li><strong>Submission Date:</strong> ${data.checkInDate}</li>
        </ul>
        <p>
          <a href="${data.dashboardLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Review Check-in
          </a>
        </p>
        <p>Best regards,<br/>Goal Portal Team</p>
      </body>
    </html>
  `;
}

/**
 * Escalation Alert Notification Template
 * Sent to manager when a goal escalates
 */
export function getEscalationAlertTemplate(data: {
  employeeName: string;
  goalTitle: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  dashboardLink: string;
}): string {
  const severityColor = {
    low: '#FFC107',
    medium: '#FF9800',
    high: '#F44336'
  }[data.severity];

  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: ${severityColor};">⚠️ Goal Escalation Alert</h2>
        <p>Hi,</p>
        <p>A goal requires your immediate attention:</p>
        <ul>
          <li><strong>Employee:</strong> ${data.employeeName}</li>
          <li><strong>Goal:</strong> ${data.goalTitle}</li>
          <li><strong>Reason:</strong> ${data.reason}</li>
          <li><strong>Severity:</strong> <span style="background-color: ${severityColor}; color: white; padding: 5px 10px; border-radius: 3px;">${data.severity.toUpperCase()}</span></li>
        </ul>
        <p>
          <a href="${data.dashboardLink}" style="background-color: ${severityColor}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Details
          </a>
        </p>
        <p>Best regards,<br/>Goal Portal Team</p>
      </body>
    </html>
  `;
}

/**
 * Manager Feedback Notification Template
 * Sent to employee when manager adds check-in comments
 */
export function getManagerFeedbackTemplate(data: {
  employeeName: string;
  managerName: string;
  quarter: string;
  feedback: string;
  dashboardLink: string;
}): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Manager Feedback on Your Check-in</h2>
        <p>Hi ${data.employeeName},</p>
        <p><strong>${data.managerName}</strong> has provided feedback on your <strong>${data.quarter}</strong> check-in:</p>
        <blockquote style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0;">
          ${data.feedback}
        </blockquote>
        <p>
          <a href="${data.dashboardLink}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Check-in
          </a>
        </p>
        <p>Best regards,<br/>Goal Portal Team</p>
      </body>
    </html>
  `;
}

/**
 * Cycle Status Notification Template
 * Sent to all users when a new cycle phase starts
 */
export function getCyclePhaseTemplate(data: {
  cycleName: string;
  phase: string;
  startDate: string;
  endDate: string;
  description: string;
  dashboardLink: string;
}): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>${data.phase} Phase Started</h2>
        <p>Hi,</p>
        <p><strong>${data.cycleName}</strong> - <strong>${data.phase}</strong> phase is now active.</p>
        <ul>
          <li><strong>Phase:</strong> ${data.phase}</li>
          <li><strong>Start Date:</strong> ${data.startDate}</li>
          <li><strong>End Date:</strong> ${data.endDate}</li>
          <li><strong>Description:</strong> ${data.description}</li>
        </ul>
        <p>
          <a href="${data.dashboardLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Go to Dashboard
          </a>
        </p>
        <p>Best regards,<br/>Goal Portal Team</p>
      </body>
    </html>
  `;
}
