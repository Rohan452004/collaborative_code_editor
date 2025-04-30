"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../middleware/auth"));
const userController_1 = require("../controllers/userController");
const room_1 = require("../controllers/room");
const resetPasswordController_1 = require("../controllers/resetPasswordController");
const router = express_1.default.Router();
// Define routes with TypeScript
router.post("/auth/google", userController_1.googlelogin);
router.post("/sendotp", userController_1.sendotp);
router.post("/signup", userController_1.registerUser);
router.post("/login", userController_1.loginUser);
router.post("/createRoom", auth_1.default, room_1.createRoom);
router.post("/requestAccess", auth_1.default, room_1.requestAccess);
router.post("/approveAccess", room_1.approveAccess);
router.get("/check-access", auth_1.default, room_1.checkAccess);
router.get("/checkUserRole", auth_1.default, room_1.checkUserRole);
router.post("/reset-password-token", resetPasswordController_1.resetPasswordToken);
router.post("/reset-password", resetPasswordController_1.resetPassword);
//logout route
router.post("/logout", userController_1.logoutUser);
exports.default = router;
