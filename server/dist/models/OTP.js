"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const mailsender_1 = require("../config/mailsender");
const EmailVerificationTemplate_1 = require("../mail/templates/EmailVerificationTemplate");
// Define OTP Schema
const OTPSchema = new mongoose_1.Schema({
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
const sendVerificationEmail = async (email, otp) => {
    try {
        const mailResponse = await (0, mailsender_1.mailSender)(email, "Verification Email", (0, EmailVerificationTemplate_1.emailTemplate)(otp));
        console.log("Email sent successfully:", mailResponse?.response);
    }
    catch (error) {
        console.error("Error occurred while sending email:", error.message);
        throw error;
    }
};
// Pre-save hook to send email after saving the document
OTPSchema.pre("save", async function (next) {
    if (this.isNew) {
        await sendVerificationEmail(this.email, this.otp);
    }
    next();
});
// Define and export OTP model
const OTP = mongoose_1.default.model("OTP", OTPSchema);
exports.default = OTP;
