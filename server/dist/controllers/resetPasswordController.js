"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.resetPasswordToken = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const mailsender_1 = require("../config/mailsender");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const frontendurl = process.env.FRONTEND_URL;
const resetPasswordToken = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel_1.default.findOne({ email });
        if (!user) {
            return res.json({
                success: false,
                message: `This Email: ${email} is not Registered With Us. Enter a Valid Email.`,
            });
        }
        const token = crypto_1.default.randomBytes(20).toString("hex");
        const updatedDetails = await userModel_1.default.findOneAndUpdate({ email }, {
            token,
            resetPasswordExpires: Date.now() + 3600000, // 1 hour expiration
        }, { new: true });
        console.log("DETAILS", updatedDetails);
        const url = `${frontendurl}/update-password/${token}`;
        await (0, mailsender_1.mailSender)(email, "Password Reset", `Your Link for email verification is ${url}. Please click this URL to reset your password.`);
        res.json({
            success: true,
            message: "Email Sent Successfully, Please Check Your Email to Continue Further",
        });
    }
    catch (error) {
        return res.json({
            error: error.message,
            success: false,
            message: "Some Error in Sending the Reset Message",
        });
    }
};
exports.resetPasswordToken = resetPasswordToken;
const resetPassword = async (req, res) => {
    try {
        const { password, confirmPassword, token } = req.body;
        if (confirmPassword !== password) {
            return res.json({
                success: false,
                message: "Password and Confirm Password Do Not Match",
            });
        }
        const userDetails = await userModel_1.default.findOne({ token });
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
        const encryptedPassword = await bcryptjs_1.default.hash(password, 10);
        await userModel_1.default.findOneAndUpdate({ token }, { password: encryptedPassword }, { new: true });
        res.json({
            success: true,
            message: "Password Reset Successful",
        });
    }
    catch (error) {
        return res.json({
            error: error.message,
            success: false,
            message: "Some Error in Updating the Password",
        });
    }
};
exports.resetPassword = resetPassword;
