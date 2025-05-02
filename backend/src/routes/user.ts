import express from "express";
import authMiddleware from "../middleware/auth";
import { registerUser, loginUser, sendotp, googlelogin } from "../controllers/userController";
import { createRoom, requestAccess, approveAccess, checkAccess, checkUserRole } from "../controllers/room";
import { resetPasswordToken, resetPassword } from "../controllers/resetPasswordController";

const router = express.Router();

// Define routes with TypeScript
router.post("/auth/google", googlelogin);
router.post("/sendotp", sendotp);
router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/createRoom", authMiddleware, createRoom);
router.post("/requestAccess", authMiddleware, requestAccess);
router.post("/approveAccess", approveAccess);
router.get("/check-access", authMiddleware, checkAccess);
router.get("/checkUserRole", authMiddleware, checkUserRole);

router.post("/reset-password-token", resetPasswordToken);
router.post("/reset-password", resetPassword);

export default router;
