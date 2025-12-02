import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMindMapBook {
  title: string;
  categories: string[];
  createdAt?: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string | null;
  image?: string | null;
  provider?: string;
  interests?: string[];
  mindMap?: IMindMapBook[];
}

const MindMapBookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    categories: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

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
      default: null,
    },

    image: {
      type: String,
      default: null,
    },

    provider: {
      type: String,
      default: "credentials",
    },

    interests: {
      type: [String],
      default: [],
    },

    mindMap: {
      type: [MindMapBookSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
