"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailSender = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const mailSender = async (email, title, body) => {
    try {
        let transporter = nodemailer_1.default.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
        let info = await transporter.sendMail({
            from: "CodeIt || Collaborative Coding Platform",
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
        });
        console.log(info);
        return info;
    }
    catch (error) {
        console.log(error);
    }
};
exports.mailSender = mailSender;
