import nodemailer from "nodemailer";
import dotenv from "dotenv";
import QRCode from "qrcode";
dotenv.config();

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, textOrHtml, isHtml = false) => {
  try {
    const info = await transporter.sendMail({
      from: `"GUC Events" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      [isHtml ? "html" : "text"]: textOrHtml,
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

export const sendBoothApprovalEmail = async (vendor, booth) => {
  if (!vendor || !vendor.email) {
    throw new Error("Invalid vendor information for sending approval email");
  }
  if (!booth || !booth.people || booth.people.length === 0) {
    throw new Error("Invalid booth information for sending approval email");
  }
  const subject = "Your Booth Request Has Been Approved!";
  let html = `
    <p>Dear ${vendor.companyname || "Vendor"},</p>
    <p>We are pleased to inform you that your booth request has been approved. Here are the details of your booth:</p>
    <ul>
      <li><strong>Booth Size:</strong> ${booth.boothSize}</li>
      ${
        booth.isBazarBooth && booth.bazarId
          ? `<li><strong>Bazar ID:</strong> ${booth.bazarId}</li>`
          : ""
      }
      ${
        booth.location
          ? `<li><strong>Location:</strong> ${booth.location}</li>`
          : ""
      }
      ${
        booth.duration
          ? `<li><strong>Duration:</strong> ${booth.duration} weeks</li>`
          : ""
      }
    </ul>
    <p>Please find below the QR codes for each of your booth representatives:</p>
  `;

  for (let i = 0; i < booth.people.length; i++) {
    const person = booth.people[i];
    const qrData = `Name: ${person.name}\nEmail: ${person.email}\nBooth ID: ${booth._id}`;
    const qrCode = await QRCode.toDataURL(qrData);

    html += `
      <div style="margin-bottom: 16px;">
        <strong>Representative ${i + 1}:</strong><br/>
        Name: ${person.name}<br/>
        Email: ${person.email}<br/>
        <img src="${qrCode}" alt="QR Code for ${
      person.name
    }" style="margin-top: 6px; width: 120px; height: 120px;"/>
      </div>
    `;
  }

  html += `
    <p>We look forward to your participation in the event. If you have any questions, please feel free to contact us.</p>
    <p>Best regards,<br/>GUC Events Team</p>
  `;
  return await sendEmail(vendor.email, subject, html, true);
};

export const sendBoothRejectionEmail = async (vendor, booth) => {
  if (!vendor || !vendor.email) {
    throw new Error("Invalid vendor information for sending rejection email");
  }
  const subject = "Your Booth Request Has Been Rejected";
  let text = `Dear ${vendor.companyname || "Vendor"},\n\n`;
  text += `We regret to inform you that your booth request`;
  if (booth && booth._id) {
    text += ` (Request ID: ${booth._id})`;
  }
  if (booth && booth.isBazarBooth) {
    text += ` for a bazar booth`;
  } else {
    text += ` for a platform booth`;
  }
  text += ` has been rejected.\n\n`;
  text += ` If you have any questions or need further information, please feel free to contact us.\n\n`;
  text += `Best regards,\nGUC Events Team`;
  return await sendEmail(vendor.email, subject, text);
};
