import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  googleAuth: any;
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  token?: string;
  resetPasswordExpires?: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, unique: true },
  password: { type: String, required: function () { return !this.googleAuth; } },
  googleAuth: { type: Boolean, default: false },
  token: { type: String},
  resetPasswordExpires:{ type: Date,}
});

export default mongoose.model<IUser>("User", userSchema);
