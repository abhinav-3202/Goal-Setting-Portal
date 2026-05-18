import mongoose, { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
  name: string;
  password: string;
  email: string;
  role: 'employee' | 'manager' | 'admin';
  managerId?: Types.ObjectId | null; 
  department: string;
  createdAt: Date;
  authProvider: 'credentials' | 'google';
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  password:{type:String, required:true},
  email: { type: String, required: true, unique: true, index: true },
  role: { type: String, enum: ['employee', 'manager', 'admin'], default: 'employee', required: true },
  managerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  department: { type: String, required: true },
  authProvider:{
        type:String,
        enum:["credentials","google"],
        required:true,
    },
}, { timestamps: true });

export const UserModel = mongoose.models.User || model<IUser>('User', UserSchema);