import mongoose, { Document, Schema, Model } from "mongoose";

// Define the participant structure
interface Participant {
  email: string;
  status: "pending" | "approved" | "denied";
}

// Define the Room document interface
interface IRoom extends Document {
  roomId: string;
  ownerEmail: string;
  participants: Participant[];
  createdAt: Date;
}

// Define the Room schema
const RoomSchema = new Schema<IRoom>({
  roomId: { type: String, required: true, unique: true },
  ownerEmail: { type: String, required: true },
  participants: [
    {
      email: { type: String, required: true },
      status: {
        type: String,
        enum: ["pending", "approved", "denied"],
        default: "pending",
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60, // Expires after 1 hour
  },
});

// Create and export the Room model
const Room: Model<IRoom> = mongoose.model<IRoom>("Room", RoomSchema);
export default Room;
