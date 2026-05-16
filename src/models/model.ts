import { Schema, model, Document, Types } from 'mongoose';

// ==========================================
// 1. USER MODEL
// ==========================================
export interface IUser extends Document {
  name: string;
  email: string;
  role: 'employee' | 'manager' | 'admin';
  managerId?: Types.ObjectId | null; // Self-referencing relationship for hierarchy
  department: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  role: { type: String, enum: ['employee', 'manager', 'admin'], default: 'employee', required: true },
  managerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  department: { type: String, required: true }
}, { timestamps: true });


// ==========================================
// 2. CYCLE MODEL
// ==========================================
export interface ICycle extends Document {
  name: string; // e.g., "FY 2026-2027"
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


// ==========================================
// 3. GOAL MODEL
// ==========================================
export interface IGoal extends Document {
  employeeId: Types.ObjectId;
  cycleId: Types.ObjectId; // Critical addition to scoped goals by assessment year
  thrustArea: string;
  title: string;
  description: string;
  uom: 'numeric_min' | 'numeric_max' | 'timeline' | 'zero-based';
  target: string; // Stored as string to easily capture dates ("2026-12-31") or raw numbers safely
  weightage: number; // Minimum 10
  status: 'draft' | 'submitted' | 'approved' | 'locked';
  isShared: boolean;
  sharedFrom?: Types.ObjectId | null; // Pointing to the primary/parent Goal ID
  lockedAt?: Date | null;
}

const GoalSchema = new Schema<IGoal>({
  employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  cycleId: { type: Schema.Types.ObjectId, ref: 'Cycle', required: true },
  thrustArea: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  uom: { type: String, enum: ['numeric_min', 'numeric_max', 'timeline', 'zero-based'], required: true },
  target: { type: String, required: true },
  weightage: { type: Number, required: true },
  status: { type: String, enum: ['draft', 'submitted', 'approved', 'locked'], default: 'draft', required: true },
  isShared: { type: Boolean, default: false },
  sharedFrom: { type: Schema.Types.ObjectId, ref: 'Goal', default: null },
  lockedAt: { type: Date, default: null }
}, { timestamps: true });




// ==========================================
// 4. CHECK-IN MODEL
// ==========================================
export interface ICheckIn extends Document {
  goalId: Types.ObjectId;
  employeeId: Types.ObjectId;
  cycleId: Types.ObjectId; // Helps optimize fetching all check-ins for a reporting loop
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  actual: string; // The user's input value
  statusTag: 'not_started' | 'on_track' | 'completed';
  managerComment?: string;
  computedScore: number; // e.g., 85.5 (calculated based on UoM rules)
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

// Prevent duplicate quarter check-ins per unique goal
CheckInSchema.index({ goalId: 1, quarter: 1 }, { unique: true });


// ==========================================
// 5. AUDIT LOG MODEL
// ==========================================
export interface IAuditChange {
  field: string;
  old: string;
  new: string;
}

export interface IAuditLog extends Document {
  entityId: Types.ObjectId; // ID of the Goal or CheckIn modified
  entityType: 'Goal' | 'CheckIn';
  changedBy: Types.ObjectId; // User ID who made the change
  changes: IAuditChange[];
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  entityId: { type: Schema.Types.ObjectId, required: true, index: true },
  entityType: { type: String, enum: ['Goal', 'CheckIn'], required: true },
  changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  changes: [{
    field: { type: String, required: true },
    old: { type: String, default: '' },
    new: { type: String, default: '' }
  }],
  timestamp: { type: Date, default: Date.now }
});


// ==========================================
// EXPORTS
// ==========================================
export const User = model<IUser>('User', UserSchema);
export const Cycle = model<ICycle>('Cycle', CycleSchema);
export const Goal = model<IGoal>('Goal', GoalSchema);
export const CheckIn = model<ICheckIn>('CheckIn', CheckInSchema);
export const AuditLog = model<IAuditLog>('AuditLog', AuditLogSchema);