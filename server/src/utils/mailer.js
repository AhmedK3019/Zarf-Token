import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: `"GUC Events" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
    console.log("Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("sendEmail failed:", err && err.message ? err.message : err);
    // rethrow to allow callers to handle and log; include message for debugging
    throw new Error(
      `sendEmail failed: ${err && err.message ? err.message : err}`
    );
  }
};
