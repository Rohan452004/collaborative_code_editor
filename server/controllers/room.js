"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUserRole = exports.checkAccess = exports.approveAccess = exports.requestAccess = exports.createRoom = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const RoomModel_1 = __importDefault(require("../models/RoomModel"));
dotenv_1.default.config();
const createRoom = async (req, res) => {
    console.log("INSIDE CREATE ROOM");
    if (!req.user) {
        res.status(401).json({ success: false, message: "Unauthorized: No user found" });
        return;
    }
    const roomId = req.body.id;
    const ownerEmail = req.user.email;
    console.log(roomId);
    console.log(ownerEmail);
    try {
        const existingRoom = await RoomModel_1.default.findOne({ roomId });
        if (existingRoom) {
            res.status(400).json({ success: false, message: "Room ID already exists" });
            return;
        }
        const newRoom = new RoomModel_1.default({ roomId, ownerEmail });
        await newRoom.save();
        console.log("Room Created");
        res.status(201).json({ success: true, message: "Room created", room: newRoom });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.createRoom = createRoom;
/**
 * @desc Request access to a room
 * @route POST /api/rooms/request-access
 * @access Public
 */
const requestAccess = async (req, res) => {
    console.log("INSIDE REQUEST ACCESS");
    if (!req.user) {
        res.status(401).json({ success: false, message: "Unauthorized: No user found" });
        return;
    }
    const roomId = req.body.roomId;
    const email = req.user.email;
    console.log(roomId);
    console.log(email);
    try {
        const room = await RoomModel_1.default.findOne({ roomId });
        if (!room) {
            res.status(404).json({ success: false, message: "Room not found" });
            return;
        }
        const existingParticipant = room.participants.find((p) => p.email === email);
        if (existingParticipant && existingParticipant.status === "denied") {
            res.status(400).json({ success: false, message: "Request already sent" });
            return;
        }
        if (!existingParticipant) {
            room.participants.push({ email, status: "pending" });
            await room.save();
            console.log("Added to DB");
        }
        const FRONTEND = process.env.FRONTEND_URL;
        const approvalLink = `${FRONTEND}/approve-access?roomId=${roomId}&email=${email}&approve=true`;
        const rejectionLink = `${FRONTEND}/approve-access?roomId=${roomId}&email=${email}&approve=false`;
        const transporter = nodemailer_1.default.createTransport({
            host: "smtp.gmail.com",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: room.ownerEmail,
            subject: "🔑 Room Access Request - Action Required",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 10px; background-color: #f9f9f9; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; text-align: center;">🔔 Access Request for Your Room</h2>
          <p style="font-size: 16px; color: #555;">
            <strong>${email}</strong> has requested access to your room <strong>${roomId}</strong>.
          </p>
          <p style="font-size: 16px; color: #555;">Please approve or reject the request using the buttons below:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${approvalLink}" style="display: inline-block; padding: 12px 20px; font-size: 16px; font-weight: bold; color: white; background-color: #28a745; text-decoration: none; border-radius: 5px; margin-right: 10px;">
               ✅ Approve
            </a>
            <a href="${rejectionLink}" style="display: inline-block; padding: 12px 20px; font-size: 16px; font-weight: bold; color: white; background-color: #dc3545; text-decoration: none; border-radius: 5px;">
               ❌ Reject
            </a>
          </div>
          <p style="font-size: 14px; color: #777; text-align: center;">If you did not expect this request, you can ignore this email.</p>
        </div>
      `,
        };
        await transporter.sendMail(mailOptions);
        console.log("Email sent");
        res.json({ success: true, message: "Request sent to room owner" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.requestAccess = requestAccess;
/**
 * @desc Approve or deny room access
 * @route POST /api/rooms/approve-access
 * @access Private (Room owner only)
 */
const approveAccess = async (req, res) => {
    const { roomId, email, isApproved } = req.body;
    try {
        const room = await RoomModel_1.default.findOne({ roomId });
        if (!room) {
            res.status(404).json({ success: false, message: "Room not found" });
            return;
        }
        const participant = room.participants.find((p) => p.email === email);
        if (!participant) {
            res.status(404).json({ success: false, message: "User not found in requests" });
            return;
        }
        participant.status = isApproved ? "approved" : "denied";
        await room.save();
        res.json({ success: true, message: `User ${isApproved ? "approved" : "denied"} access` });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.approveAccess = approveAccess;
/**
 * @desc Check access status
 * @route GET /api/rooms/check-access
 * @access Public
 */
const checkAccess = async (req, res) => {
    console.log("INSIDE CHECK ACCESS");
    if (!req.user) {
        res.status(401).json({ success: false, message: "Unauthorized: No user found" });
        return;
    }
    const { roomId } = req.query;
    const email = req.user.email;
    try {
        const room = await RoomModel_1.default.findOne({ roomId });
        if (!room) {
            res.status(404).json({ status: "not found" });
            return;
        }
        const participant = room.participants.find((p) => p.email === email);
        res.json({ status: participant ? participant.status : "not found" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ status: "error" });
    }
};
exports.checkAccess = checkAccess;
/**
 * @desc Check user role
 * @route GET /api/rooms/check-role
 * @access Public
 */
const checkUserRole = async (req, res) => {
    console.log("INSIDE CHECKUSER ROLE");
    if (!req.user) {
        res.status(401).json({ success: false, message: "Unauthorized: No user found" });
        return;
    }
    const { roomId } = req.query;
    const email = req.user.email;
    try {
        const room = await RoomModel_1.default.findOne({ roomId });
        if (!room) {
            res.status(404).json({ message: "Room not found" });
            return;
        }
        if (room.ownerEmail === email) {
            res.json({ role: "owner" });
            return;
        }
        const participant = room.participants.find((p) => p.email === email);
        res.json({ role: participant && participant.status === "approved" ? "approved" : "pending" });
    }
    catch (error) {
        console.error("Error checking user role:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.checkUserRole = checkUserRole;
