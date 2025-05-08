"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authMiddleware = async (req, res, next) => {
    console.log("INSIDE AUTH MIDDLEWARE");
    let token = req.cookies?.token;
    console.log("Token is", token);
    if (!token) {
        return res.status(401).json({ success: false, message: "Not Authorized, login again" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.userId, email: decoded.email };
        console.log("User Email:", req.user.email);
        next();
    }
    catch (error) {
        console.log("JWT Verification Error:", error);
        res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};
exports.default = authMiddleware;
