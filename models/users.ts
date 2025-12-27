import mongoose, { Document, Model, Schema } from "mongoose";

// -------------------- INTERFACES --------------------
export interface IBridge {
  fromCategory: string;
  toCategory: string;
  recommendedBook: string;
  bookImage?: string;
  bookLink?: string;
}
export interface IBookItem {
  title: string;
  image?: string;
  authors?: string[];
}

export interface ICategory {
  name: string;
  image: string;
  books: IBookItem[];
  count: number;
  x: number;
  y: number;
}
export interface INotification {
  id: string;
  type: "smart-link" | "achievement";
  title: string;
  bookTitle?: string;
  bookImage?: string;
  message: string;
  categories?: [string, string];
  isRead: boolean;
  createdAt: Date;
}
export interface IMindMapBook {
  title: string;
  categories: ICategory[];
  createdAt?: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string | null;
  image?: string | null;
  provider?: string;
  interests?: string[];
  mindMap?: ICategory[];
  bridges: IBridge[];
  favorites: IFavorite[];
  notifications: INotification[];
}

export interface BookVolumeInfo {
  title: string;
  description?: string;
  infoLink?: string;
  authors?: string[];
  categories?: string[];
  imageLinks?: {
    smallThumbnail: string;
    thumbnail: string;
  };
}

export interface BookItem {
  id: string;
  volumeInfo: BookVolumeInfo;
}

export interface IFavorite {
  bookTitle: string;
  bookAuthors?: string[];
  bookImage?: string;
}
export interface SearchResults {
  items?: BookItem[];
  error?: string;
}
// -------------------- SCHEMAS --------------------

const BookItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
  },
  { _id: false }
);
const FavoriteSchema = new mongoose.Schema(
  {
    bookTitle: { type: String, required: true },
    bookAuthors: { type: [String], default: [] },
    bookImage: { type: String, default: null },
  },
  { _id: false }
);
const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, default: null },
    books: { type: [BookItemSchema], default: [] },
    count: { type: Number, default: 0 },
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
  },
  { _id: false }
);
const NotificationSchema = new Schema({
  id: { type: String, default: () => Math.random().toString(36).substring(7) },
  type: {
    type: String,
    enum: ["smart-link", "achievement"],
    default: "smart-link",
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  bookTitle: { type: String },
  bookImage: { type: String },
  categories: { type: [String], default: [] },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
const BridgeSchema = new mongoose.Schema(
  {
    fromCategory: { type: String, required: true },
    toCategory: { type: String, required: true },
    recommendedBook: { type: String, required: true },
    bookImage: { type: String, default: null },
    bookLink: { type: String, default: null },
  },
  { _id: false }
);
const UserSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, default: null },

    image: { type: String, default: null },

    provider: { type: String, default: "credentials" },

    interests: { type: [String], default: [] },

    mindMap: { type: [CategorySchema], default: [] },
    bridges: { type: [BridgeSchema], default: [] },
    favorites: { type: [FavoriteSchema], default: [] },
    notifications: { type: [NotificationSchema], default: [] },
  },
  { timestamps: true }
);

// -------------------- MODEL --------------------

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
