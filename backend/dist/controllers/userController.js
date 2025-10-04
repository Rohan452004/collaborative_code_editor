"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.googlelogin = exports.sendotp = exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const validator_1 = __importDefault(require("validator"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../models/userModel"));
const OTP_1 = __importDefault(require("../models/OTP"));
const otpGenerator = require("otp-generator");
const dotenv_1 = __importDefault(require("dotenv"));
const google_auth_library_1 = require("google-auth-library");
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const createToken = (id, email) => {
    return jsonwebtoken_1.default.sign({ userId: id, email }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};
const registerUser = async (req, res) => {
    console.log(req.body);
    const { username, email, password, confirmPassword, otp } = req.body;
    try {
        if (!username || !email || !password || !otp) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        if (!validator_1.default.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Please enter a valid email" });
        }
        const exists = await userModel_1.default.findOne({ email });
        if (exists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }
        // Find the most recent OTP for the email
        const response = await OTP_1.default.find({ email })
            .sort({ createdAt: -1 })
            .limit(1);
        console.log(response);
        if (response.length === 0) {
            // OTP not found for the email
            return res.status(400).json({
                success: false,
                message: "No OTP found for the email",
            });
        }
        else if (otp !== response[0].otp) {
            // Invalid OTP
            return res.status(400).json({
                success: false,
                message: "The OTP is not valid",
            });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const newUser = new userModel_1.default({
            name: username,
            email,
            password: hashedPassword,
        });
        console.log("New User", newUser);
        const user = await newUser.save();
        const token = createToken(user._id.toString(), user.email);
        res.status(201).json({
            success: true,
            token,
            message: "User registered successfully",
            user: { id: user._id, name: user.name, email: user.email },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    console.log("Inside Login User", req.body);
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const user = await userModel_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        const token = createToken(user._id.toString(), user.email);
        console.log("Generated Token:", token);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.json({
            success: true,
            token,
            message: "User logged in successfully",
            user: { id: user._id, name: user.name, email: user.email },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.loginUser = loginUser;
// Send OTP For Email Verification
const sendotp = async (req, res) => {
    console.log("INSIDE SEND OTP");
    try {
        const { email } = req.body;
        const checkUserPresent = await userModel_1.default.findOne({ email });
        // If user found with provided email
        if (checkUserPresent) {
            // Return 401 Unauthorized status code with error message
            return res.status(401).json({
                success: false,
                message: `User is Already Registered`,
            });
        }
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        const result = await OTP_1.default.findOne({ otp: otp });
        console.log("Result is Generate OTP Func");
        console.log("OTP", otp);
        console.log("Result", result);
        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
            });
        }
        const otpPayload = { email, otp };
        const otpBody = await OTP_1.default.create(otpPayload);
        console.log("OTP Body", otpBody);
        res.status(200).json({
            success: true,
            message: `OTP Sent Successfully`,
            otp,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, error: error });
    }
};
exports.sendotp = sendotp;
const googlelogin = async (req, res) => {
    console.log("Inside Google Login");
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ success: false, message: "Token is required" });
        }
        // 🔹 Fetch Google User Info from Backend (to bypass CORS)
        const googleRes = await axios_1.default.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${token}` },
        });
        const { email, name } = googleRes.data;
        // 🔹 Check if user exists in DB
        let user = await userModel_1.default.findOne({ email });
        if (!user) {
            user = new userModel_1.default({ name, email, googleAuth: true });
            await user.save();
        }
        // 🔹 Generate JWT Token for session
        const appToken = jsonwebtoken_1.default.sign({ userId: user._id, email }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", appToken, {
            httpOnly: true,
            // secure: process.env.NODE_ENV === "production",
            // sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.json({ success: true, token: appToken, user });
    }
    catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ success: false, message: "Google Authentication Failed" });
    }
};
exports.googlelogin = googlelogin;
//logout
const logoutUser = async (req, res) => {
    try {
        // Clear the token cookie
        res.clearCookie("token", {
            httpOnly: true,
            // secure: process.env.NODE_ENV === "production",
            // sameSite: "Strict",
        });
        res.status(200).json({
            success: true,
            message: "User logged out successfully",
        });
    }
    catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({
            success: false,
            message: "Logout failed",
        });
    }
};
exports.logoutUser = logoutUser;
