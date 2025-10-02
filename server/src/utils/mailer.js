import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, text) => {
  await transporter.sendMail({
    from: `"GUC Events" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
};
