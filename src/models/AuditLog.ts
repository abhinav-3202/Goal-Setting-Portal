import mongoose, { Schema, model, Document, Types } from 'mongoose';

export interface IAuditChange {
  field: string;
  old: string;
  new: string;
}

export interface IAuditLog extends Document {
  entityId: Types.ObjectId; 
  entityType: 'Goal' | 'CheckIn';
  changedBy: Types.ObjectId; 
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

export const AuditLog = mongoose.models.AuditLog || model<IAuditLog>('AuditLog', AuditLogSchema);