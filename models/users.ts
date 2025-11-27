import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string | null;
  image?: string | null;
  provider?: string; // google | credentials
}

const UserSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true, 
    },

    password: {
      type: String,
      required: false, 
      default: null,
    },

    image: {
      type: String,
      required: false,
      default: null,
    },

    provider: {
      type: String,
      required: false,
      default: "credentials", 
    },
    
  },
  {
    timestamps: true,
  }
);


const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
