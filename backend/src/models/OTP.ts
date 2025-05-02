import mongoose, { Document, Model, Schema } from "mongoose";
import { mailSender } from "../config/mailsender";
import { emailTemplate } from "../mail/templates/EmailVerificationTemplate";

// Define OTP interface extending Mongoose Document
interface IOTP extends Document {
  email: string;
  otp: string;
  createdAt: Date;
}

// Define OTP Schema
const OTPSchema = new Schema<IOTP>({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5, // Expires after 5 minutes
  },
});

// Function to send verification email
const sendVerificationEmail = async (email: string, otp: string): Promise<void> => {
  try {
    const mailResponse = await mailSender(email, "Verification Email", emailTemplate(otp));
    console.log("Email sent successfully:", mailResponse?.response);
  } catch (error) {
    console.error("Error occurred while sending email:", (error as Error).message);
    throw error;
  }
};

// Pre-save hook to send email after saving the document
OTPSchema.pre<IOTP>("save", async function (next) {
  if (this.isNew) {
    await sendVerificationEmail(this.email, this.otp);
  }
  next();
});

// Define and export OTP model
const OTP: Model<IOTP> = mongoose.model<IOTP>("OTP", OTPSchema);
export default OTP;
