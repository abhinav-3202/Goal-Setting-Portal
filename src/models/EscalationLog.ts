import mongoose, { Schema, model, Document, Types } from 'mongoose';

export interface IEscalationLog extends Document {
  ruleId: Types.ObjectId; // Reference to the rule that triggered
  goalId: Types.ObjectId; // Goal that triggered the escalation
  employeeId: Types.ObjectId; // Employee whose goal escalated
  managerId: Types.ObjectId; // Manager to notify
  reason: string; // Why it was escalated (e.g., "Actual < Target")
  actualValue: number; // The actual value that triggered the rule
  status: 'pending' | 'acknowledged' | 'resolved'; // Escalation status
  acknowledgedAt?: Date; // When manager acknowledged it
  resolvedAt?: Date; // When it was resolved
  resolutionNotes?: string; // What was done to resolve
  createdAt: Date;
}

const EscalationLogSchema = new Schema<IEscalationLog>({
  ruleId: { type: Schema.Types.ObjectId, ref: 'EscalationRule', required: true, index: true },
  goalId: { type: Schema.Types.ObjectId, ref: 'Goal', required: true, index: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  managerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  reason: { type: String, required: true },
  actualValue: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'resolved'],
    default: 'pending',
    index: true
  },
  acknowledgedAt: { type: Date, default: null },
  resolvedAt: { type: Date, default: null },
  resolutionNotes: { type: String, default: '' },
}, { timestamps: true });

export const EscalationLog =
  mongoose.models.EscalationLog ||
  model<IEscalationLog>('EscalationLog', EscalationLogSchema);
