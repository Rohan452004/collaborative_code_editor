import { Request, Response } from "express";
import User from "../models/userModel";
import {mailSender} from "../config/mailsender";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();
const frontendurl = process.env.FRONTEND_URL as string;

export const resetPasswordToken = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: `This Email: ${email} is not Registered With Us. Enter a Valid Email.`,
      });
    }
    
    const token = crypto.randomBytes(20).toString("hex");

    const updatedDetails = await User.findOneAndUpdate(
      { email },
      {
        token,
        resetPasswordExpires: Date.now() + 3600000, // 1 hour expiration
      },
      { new: true }
    );
    
    console.log("DETAILS", updatedDetails);

    const url = `${frontendurl}/update-password/${token}`;

    await mailSender(
      email,
      "Password Reset",
      `Your Link for email verification is ${url}. Please click this URL to reset your password.`
    );

    res.json({
      success: true,
      message: "Email Sent Successfully, Please Check Your Email to Continue Further",
    });
  } catch (error: any) {
    return res.json({
      error: error.message,
      success: false,
      message: "Some Error in Sending the Reset Message",
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { password, confirmPassword, token } = req.body;

    if (confirmPassword !== password) {
      return res.json({
        success: false,
        message: "Password and Confirm Password Do Not Match",
      });
    }

    const userDetails = await User.findOne({ token });
    if (!userDetails) {
      return res.json({
        success: false,
        message: "Token is Invalid",
      });
    }

    if (!userDetails.resetPasswordExpires || userDetails.resetPasswordExpires.getTime() < Date.now()) {
        return res.status(403).json({
        success: false,
        message: "Token is Expired, Please Regenerate Your Token",
      });
    }

    
    const encryptedPassword = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate(
      { token },
      { password: encryptedPassword },
      { new: true }
    );

    res.json({
      success: true,
      message: "Password Reset Successful",
    });
  } catch (error: any) {
    return res.json({
      error: error.message,
      success: false,
      message: "Some Error in Updating the Password",
    });
  }
};