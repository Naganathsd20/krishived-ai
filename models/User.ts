import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotificationPreferences {
  diseaseAlerts: boolean;
  weatherAlerts: boolean;
  soilAdvisories: boolean;
}

export interface IUser extends Document {
  clerkId: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  language: string;
  defaultLocation?: string;
  defaultCrop?: string;
  notificationPreferences?: INotificationPreferences;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "Farmer",
    },
    language: {
      type: String,
      default: "English",
    },
    defaultLocation: {
      type: String,
      default: "Pune",
    },
    defaultCrop: {
      type: String,
      default: "Wheat & Mustard",
    },
    notificationPreferences: {
      diseaseAlerts: { type: Boolean, default: true },
      weatherAlerts: { type: Boolean, default: true },
      soilAdvisories: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
