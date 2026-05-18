import mongoose, {
  Schema,
  model,
  Document,
  Types,
} from 'mongoose'

export interface IGoal extends Document {
  employeeId: Types.ObjectId
  cycleId: Types.ObjectId

  thrustArea: string
  title: string
  description: string

  uom:
    | 'numeric_min'
    | 'numeric_max'
    | 'timeline'
    | 'zero-based'

  target: string
  weightage: number

  status:
    | 'draft'
    | 'submitted'
    | 'approved'
    | 'locked'

  isShared: boolean

  sharedFrom?: Types.ObjectId | null
  lockedAt?: Date | null
}

const GoalSchema = new Schema<IGoal>(
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
    },

    thrustArea: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: '',
    },

    uom: {
      type: String,
      enum: [
        'numeric_min',
        'numeric_max',
        'timeline',
        'zero-based',
      ],
      required: true,
    },

    target: {
      type: String,
      required: true,
    },

    weightage: {
      type: Number,
      required: true,
      min: 10,
      max: 100,
    },

    status: {
      type: String,
      enum: ['draft', 'submitted', 'approved', 'locked'],
      default: 'draft',
      required: true,
    },

    isShared: {
      type: Boolean,
      default: false,
    },

    sharedFrom: {
      type: Schema.Types.ObjectId,
      ref: 'Goal',
      default: null,
    },

    lockedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

export const Goal =
  mongoose.models.Goal ||
  model<IGoal>('Goal', GoalSchema)  