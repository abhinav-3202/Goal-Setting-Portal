import mongoose, { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
  username?: string; // Add username field
  name: string;
  password: string;
  email: string;
  role: 'employee' | 'manager' | 'admin';
  managerId?: Types.ObjectId | null; 
  department: string;
  isVerified?: boolean; // Add email verification field
  createdAt: Date;
  authProvider: 'credentials' | 'google';
}

const UserSchema = new Schema<IUser>({
  username: { type: String, unique: true, sparse: true }, // Allow null for google auth users
  name: { type: String, required: true },
  password:{type:String, required:true},
  email: { type: String, required: true, unique: true, index: true },
  role: { type: String, enum: ['employee', 'manager', 'admin'], default: 'employee', required: true },
  managerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  department: { type: String, default: "" },
  authProvider:{
        type:String,
        enum:["credentials","google"],
        required:true,
    },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

export const UserModel = mongoose.models.User || model<IUser>('User', UserSchema);