"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailSender = void 0;
const googleapis_1 = require("googleapis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const REDIRECT_URI = "https://developers.google.com/oauthplayground"; // or your own redirect URI
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const GMAIL_USER = process.env.GMAIL_USER;
const oAuth2Client = new googleapis_1.google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
const mailSender = async (email, title, body) => {
    try {
        const accessToken = await oAuth2Client.getAccessToken();
        const gmail = googleapis_1.google.gmail({ version: "v1", auth: oAuth2Client });
        const encodedMessage = Buffer.from(`From: "CodeIt" <${GMAIL_USER}>\r\n` +
            `To: ${email}\r\n` +
            `Subject: ${title}\r\n` +
            `Content-Type: text/html; charset=utf-8\r\n\r\n` +
            `${body}`)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");
        const result = await gmail.users.messages.send({
            userId: "me",
            requestBody: {
                raw: encodedMessage,
            },
        });
        console.log("Email sent successfully:", result.data);
        return result.data;
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};
exports.mailSender = mailSender;
