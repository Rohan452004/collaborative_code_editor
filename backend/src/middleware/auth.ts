import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface DecodedToken {
  userId: string;
  email: string;
}

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
}

const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.log("INSIDE AUTH MIDDLEWARE");
  let token = req.cookies?.token;

  console.log("Token is", token);

  if (!token) {
    return res.status(401).json({ success: false, message: "Not Authorized, login again" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    req.user = { id: decoded.userId, email: decoded.email };

    console.log("User Email:", req.user.email);

    next();
  } catch (error) {
    console.log("JWT Verification Error:", error);
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export default authMiddleware;
