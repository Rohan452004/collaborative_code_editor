"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const outputController_1 = require("../controllers/outputController");
const router = express_1.default.Router();
// Define routes with TypeScript
router.post("/run-code", outputController_1.RunCode);
router.get("/get-output/:token", outputController_1.GetOutput);
exports.default = router;
