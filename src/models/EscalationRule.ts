import mongoose, { Schema, model, Document, Types } from 'mongoose';

export interface IEscalationRule extends Document {
  name: string;
  description?: string;
  condition: {
    field: 'actual' | 'target' | 'weightage' | 'progress'; // What to monitor
    operator: '<' | '>' | '=' | '!='; // Comparison operator
    value: number; // Threshold value
  };
  escalateToRoles: ('employee' | 'manager' | 'admin')[]; // Who gets notified
  isActive: boolean;
  createdBy: Types.ObjectId; // User who created the rule
  createdAt: Date;
  updatedAt: Date;
}

const EscalationRuleSchema = new Schema<IEscalationRule>({
  name: { type: String, required: true, index: true },
  description: { type: String, default: '' },
  condition: {
    field: {
      type: String,
      enum: ['actual', 'target', 'weightage', 'progress'],
      required: true
    },
    operator: {
      type: String,
      enum: ['<', '>', '=', '!='],
      required: true
    },
    value: {
      type: Number,
      required: true
    }
  },
  escalateToRoles: {
    type: [String],
    enum: ['employee', 'manager', 'admin'],
    default: ['manager', 'admin']
  },
  isActive: { type: Boolean, default: true, index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const EscalationRule =
  mongoose.models.EscalationRule ||
  model<IEscalationRule>('EscalationRule', EscalationRuleSchema);
