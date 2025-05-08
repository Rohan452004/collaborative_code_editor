"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOutput = exports.RunCode = void 0;
const axios_1 = __importDefault(require("axios"));
// Run Code Function
const RunCode = async (req, res) => {
    const { language_id, source_code, stdin } = req.body;
    if (!language_id || !source_code) {
        return res.status(400).json({ error: "Language ID and source code are required!" });
    }
    try {
        const submissionResponse = await axios_1.default.post(`${process.env.JUDGE0_API_BASE_URL}/submissions`, {
            language_id,
            source_code,
            stdin,
            base64_encoded: true, // Encode request data in base64
        }, {
            headers: {
                "X-RapidAPI-Key": process.env.RAPIDAPI_KEY || "",
                "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
                "Content-Type": "application/json",
            },
        });
        res.json({ token: submissionResponse.data.token });
    }
    catch (error) {
        console.error("Error while submitting code:", error.message);
        res.status(500).json({ error: "Failed to submit code for execution." });
    }
};
exports.RunCode = RunCode;
// Get Output Function
const GetOutput = async (req, res) => {
    const { token } = req.params;
    if (!token) {
        return res.status(400).json({ error: "Token is required!" });
    }
    try {
        const result = await axios_1.default.get(`${process.env.JUDGE0_API_BASE_URL}/submissions/${token}`, {
            params: { base64_encoded: true, fields: "*" },
            headers: {
                "X-RapidAPI-Key": process.env.RAPIDAPI_KEY || "",
                "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            },
        });
        if (result.data.status.id <= 2) {
            return res.json({ status: "Processing", output: "Execution is still in progress..." });
        }
        // Decode base64 outputs
        const decodedOutput = result.data.stdout ? Buffer.from(result.data.stdout, "base64").toString("utf-8") : "";
        const decodedError = result.data.stderr ? Buffer.from(result.data.stderr, "base64").toString("utf-8") : "";
        const decodedCompileOutput = result.data.compile_output ? Buffer.from(result.data.compile_output, "base64").toString("utf-8") : "";
        res.json({
            status: result.data.status.description,
            output: decodedOutput || decodedError || decodedCompileOutput,
        });
    }
    catch (error) {
        console.error("Error while fetching output:", error.message);
        res.status(500).json({ error: "Failed to fetch code execution result." });
    }
};
exports.GetOutput = GetOutput;
