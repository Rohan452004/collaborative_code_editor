import express from "express";
import { RunCode, GetOutput } from "../controllers/outputController";

const router = express.Router();

// Define routes with TypeScript
router.post("/run-code", RunCode);
router.get("/get-output/:token", GetOutput);

export default router;
