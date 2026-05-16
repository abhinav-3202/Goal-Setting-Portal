import mongoose, { Schema, model, Document } from 'mongoose';

export interface ICycle extends Document {
  name: string; 
  phase: 'goal_setting' | 'q1' | 'q2' | 'q3' | 'q4_annual';
  openDate: Date;
  closeDate: Date;
  isActive: boolean;
}

const CycleSchema = new Schema<ICycle>({
  name: { type: String, required: true },
  phase: { type: String, enum: ['goal_setting', 'q1', 'q2', 'q3', 'q4_annual'], required: true },
  openDate: { type: Date, required: true },
  closeDate: { type: Date, required: true },
  isActive: { type: Boolean, default: false, index: true }
}, { timestamps: true });

export const Cycle = mongoose.models.Cycle || model<ICycle>('Cycle', CycleSchema);