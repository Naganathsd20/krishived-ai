import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessageSubdocument {
  id: string;
  sender: "user" | "ai";
  text: string;
  image?: string;
  timestamp: Date;
}

export interface IConversationModel extends Document {
  clerkUserId: string;
  title: string;
  messages: IMessageSubdocument[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessageSubdocument>(
  {
    id: { type: String, required: true },
    sender: { type: String, enum: ["user", "ai"], required: true },
    text: { type: String, required: true },
    image: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ConversationSchema = new Schema<IConversationModel>(
  {
    clerkUserId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    messages: {
      type: [MessageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Conversation: Model<IConversationModel> =
  mongoose.models.Conversation ||
  mongoose.model<IConversationModel>("Conversation", ConversationSchema);

export default Conversation;
