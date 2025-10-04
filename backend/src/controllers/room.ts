import { Request, Response } from "express";
import dotenv from "dotenv";
import Room from "../models/RoomModel";
import { mailSender } from "../config/mailsender";

dotenv.config();

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
}

export const createRoom = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  console.log("INSIDE CREATE ROOM");

  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized: No user found" });
    return;
  }

  const roomId: string = req.body.id;
  const ownerEmail: string = req.user.email;

  console.log(roomId);
  console.log(ownerEmail);

  try {
    const existingRoom = await Room.findOne({ roomId });
    if (existingRoom) {
      res.status(400).json({ success: false, message: "Room ID already exists" });
      return;
    }

    const newRoom = new Room({ roomId, ownerEmail });
    await newRoom.save();
    console.log("Room Created");

    res.status(201).json({ success: true, message: "Room created", room: newRoom });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc Request access to a room
 * @route POST /api/rooms/request-access
 * @access Public
 */
export const requestAccess = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  console.log("INSIDE REQUEST ACCESS");

  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized: No user found" });
    return;
  }

  const roomId: string = req.body.roomId;
  const email: string = req.user.email;

  console.log(roomId);
  console.log(email);

  try {
    const room = await Room.findOne({ roomId });
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

    const FRONTEND = process.env.FRONTEND_URL!;
    const approvalLink = `${FRONTEND}/approve-access?roomId=${roomId}&email=${email}&approve=true`;
    const rejectionLink = `${FRONTEND}/approve-access?roomId=${roomId}&email=${email}&approve=false`;

    const emailHtml = `
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
    `;

    // Send email using Resend via mailSender
    await mailSender(
      room.ownerEmail,
      "🔑 Room Access Request - Action Required",
      emailHtml
    );

    console.log("Email sent successfully to room owner");
    res.json({ success: true, message: "Request sent to room owner" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc Approve or deny room access
 * @route POST /api/rooms/approve-access
 * @access Private (Room owner only)
 */
export const approveAccess = async (req: Request, res: Response): Promise<void> => {
  const { roomId, email, isApproved }: { roomId: string; email: string; isApproved: boolean } = req.body;

  try {
    const room = await Room.findOne({ roomId });
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc Check access status
 * @route GET /api/rooms/check-access
 * @access Public
 */
export const checkAccess = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  console.log("INSIDE CHECK ACCESS");

  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized: No user found" });
    return;
  }

  const { roomId } = req.query;
  const email: string = req.user.email;

  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      res.status(404).json({ status: "not found" });
      return;
    }

    const participant = room.participants.find((p) => p.email === email);
    res.json({ status: participant ? participant.status : "not found" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error" });
  }
};

/**
 * @desc Check user role
 * @route GET /api/rooms/check-role
 * @access Public
 */
export const checkUserRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  console.log("INSIDE CHECKUSER ROLE");

  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized: No user found" });
    return;
  }

  const { roomId } = req.query;
  const email: string = req.user.email;

  try {
    const room = await Room.findOne({ roomId });
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
  } catch (error) {
    console.error("Error checking user role:", error);
    res.status(500).json({ message: "Server error" });
  }
};
