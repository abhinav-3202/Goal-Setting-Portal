import mongoose, { Schema, model, Document, Types } from 'mongoose';

export interface ICheckIn extends Document {
  goalId: Types.ObjectId;
  employeeId: Types.ObjectId;
  cycleId: Types.ObjectId; 
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  actual: string; 
  statusTag: 'not_started' | 'on_track' | 'completed';
  managerComment?: string;
  computedScore: number; 
}

const CheckInSchema = new Schema<ICheckIn>({
  goalId: { type: Schema.Types.ObjectId, ref: 'Goal', required: true, index: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  cycleId: { type: Schema.Types.ObjectId, ref: 'Cycle', required: true },
  quarter: { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4'], required: true },
  actual: { type: String, required: true },
  statusTag: { type: String, enum: ['not_started', 'on_track', 'completed'], default: 'not_started', required: true },
  managerComment: { type: String, default: '' },
  computedScore: { type: Number, default: 0 }
}, { timestamps: true });

CheckInSchema.index({ goalId: 1, quarter: 1 }, { unique: true });

export const CheckIn = mongoose.models.CheckIn || model<ICheckIn>('CheckIn', CheckInSchema);