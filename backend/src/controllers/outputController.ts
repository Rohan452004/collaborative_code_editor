import { Request, Response } from "express";
import axios from "axios";

// Run Code Function
export const RunCode = async (req: Request, res: Response) => {
  const { language_id, source_code, stdin } = req.body;

  if (!language_id || !source_code) {
    return res.status(400).json({ error: "Language ID and source code are required!" });
  }

  try {
    const submissionResponse = await axios.post(
      `${process.env.JUDGE0_API_BASE_URL}/submissions`,
      {
        language_id,
        source_code,
        stdin,
        base64_encoded: true, // Encode request data in base64
      },
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY || "", // Use env variables for security
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ token: submissionResponse.data.token });
  } catch (error: any) {
    console.error("Error while submitting code:", error.message);
    res.status(500).json({ error: "Failed to submit code for execution." });
  }
};

// Get Output Function
export const GetOutput = async (req: Request, res: Response) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ error: "Token is required!" });
  }

  try {
    const result = await axios.get(`${process.env.JUDGE0_API_BASE_URL}/submissions/${token}`, {
      params: { base64_encoded: true, fields: "*" },
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY || "", // Use env variable
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
  } catch (error: any) {
    console.error("Error while fetching output:", error.message);
    res.status(500).json({ error: "Failed to fetch code execution result." });
  }
};
