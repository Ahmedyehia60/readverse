// /models/passwordReset.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPasswordReset extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
}

const PasswordResetSchema: Schema<IPasswordReset> = new mongoose.Schema(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

const PasswordReset: Model<IPasswordReset> =
  mongoose.models.PasswordReset ||
  mongoose.model<IPasswordReset>("PasswordReset", PasswordResetSchema);

export default PasswordReset;
