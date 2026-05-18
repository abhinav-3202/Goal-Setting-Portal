import mongoose, { Schema, model, Document, Types } from 'mongoose'

export interface IGoalSheet extends Document {
  employeeId: Types.ObjectId
  cycleId: Types.ObjectId
  status: 'draft' | 'submitted' | 'approved' | 'locked'
  submittedAt?: Date | null
  approvedAt?: Date | null
  lockedAt?: Date | null
  returnComment?: string | null
}

const GoalSheetSchema = new Schema<IGoalSheet>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    cycleId: {
      type: Schema.Types.ObjectId,
      ref: 'Cycle',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'approved', 'locked'],
      default: 'draft',
      required: true,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    lockedAt: {
      type: Date,
      default: null,
    },
    returnComment: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
)

// Create compound index for employee + cycle to ensure one sheet per employee per cycle
GoalSheetSchema.index({ employeeId: 1, cycleId: 1 }, { unique: true })

export const GoalSheet =
  mongoose.models.GoalSheet || model<IGoalSheet>('GoalSheet', GoalSheetSchema)
