import nodemailer from "nodemailer";
import dotenv from "dotenv";
import QRCode from "qrcode";
import User from "../models/User.js";
import EventsOffice from "../models/EventsOffice.js";
dotenv.config();

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (
  to,
  subject,
  textOrHtml,
  isHtml = false,
  attachments = [],
  cc = []
) => {
  try {
    const info = await transporter.sendMail({
      from: `"GUC Events" <${process.env.EMAIL_USER}>`,
      to,
      cc: [...cc, process.env.EMAIL_USER], // CC to GUC Events team for record-keeping
      subject,
      [isHtml ? "html" : "text"]: textOrHtml,
      attachments,
    });
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
    <p>We are pleased to inform you that your booth request has been approved.</p>
    <p>
    Here are the details of your booth:</p>
    <ul>
      <li><strong>Booth Size:</strong> ${booth.boothSize}</li>
      ${
        booth.isBazarBooth && booth.bazarId
          ? `<li><strong>Bazar ID:</strong> ${booth.bazarId._id}</li>`
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
      ${
        booth.startdate
          ? `<li><strong>Start Date:</strong> ${new Date(
              booth.startdate
            ).toLocaleDateString()}</li>`
          : ""
      }
      ${
        booth.enddate
          ? `<li><strong>End Date:</strong> ${new Date(
              booth.enddate
            ).toLocaleDateString()}</li>`
          : ""
      }
      ${
        booth.price ? `<li><strong>Price:</strong> ${booth.price} EGP</li>` : ""
      }
      ${
        booth.paymentDueDate
          ? `<li><strong>Payment Due Date:</strong> ${new Date(
              booth.paymentDueDate
            ).toLocaleDateString()}</li>`
          : ""
      }
      ${
        booth.people.length
          ? `<li><strong>Representatives:</strong> ${booth.people
              .map((person) => person.name)
              .join(", ")}</li>`
          : ""
      }
    </ul>
  `;

  html += `
    <p>We look forward to your participation in the event. If you have any questions, please feel free to contact us.</p>
    <p>Best regards,<br/>GUC Events Team</p>
  `;
  return await sendEmail(vendor.email, subject, html, true, []);
};

export const sendBoothPaymentReceiptEmail = async (vendor, booth) => {
  if (!vendor || !vendor.email) {
    throw new Error("Invalid vendor information for sending payment receipt");
  }
  if (!booth) {
    throw new Error("Invalid booth information for sending payment receipt");
  }
  const subject = "Payment Receipt for Your Booth Participation";
  let html = `
    <p>Dear ${vendor.companyname || "Vendor"},</p>
    <p>Thank you for your payment for your booth participation. This email confirms that your payment has been received.</p>
    <p>Here are the details of your booth:</p>
    <ul>
      <li><strong>Booth Size:</strong> ${booth.boothSize}</li>
      ${
        booth.isBazarBooth && booth.bazarId
          ? `<li><strong>Bazar ID:</strong> ${booth.bazarId._id}</li>`
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
      ${
        booth.startdate
          ? `<li><strong>Start Date:</strong> ${new Date(
              booth.startdate
            ).toLocaleDateString()}</li>`
          : ""
      }
      ${
        booth.enddate
          ? `<li><strong>End Date:</strong> ${new Date(
              booth.enddate
            ).toLocaleDateString()}</li>`
          : ""
      }
      <li><strong>Amount Paid:</strong> ${booth.price} EGP</li>
      <li><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</li>
    </ul>
    <p>Please find below the QR codes for each of your booth representatives:</p>
  `;

  const attachments = [];
  for (let i = 0; i < booth.people.length; i++) {
    const person = booth.people[i];
    const qrData = `Name: ${person.name}\nEmail: ${person.email}\nBooth ID: ${booth._id}`;
    // generate PNG buffer for QR code
    const qrBuffer = await QRCode.toBuffer(qrData, { type: "png" });
    const cid = `qr-${booth._id}-${i}@guc`;
    attachments.push({ filename: `qr-${i + 1}.png`, content: qrBuffer, cid });

    html += `
      <div style="margin-bottom: 16px;">
        <strong>Representative ${i + 1}:</strong><br/>
        Name: ${person.name}<br/>
        Email: ${person.email}<br/>
        <img src="cid:${cid}" alt="QR Code for ${
      person.name
    }" style="margin-top: 6px; width: 120px; height: 120px;"/>
      </div>
    `;
  }

  html += `
    <p>We look forward to your participation in the event. If you have any questions, please feel free to contact us.</p>
    <p>Best regards,<br/>GUC Events Team</p>
  `;
  return await sendEmail(vendor.email, subject, html, true, attachments);
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

// Send a payment receipt email to the payer
// params: { to, name, eventType, eventName, amount, currency = "EGP", paymentMethod, date = new Date(), transactionId }
export const sendPaymentReceiptEmail = async (params) => {
  const {
    to,
    name,
    eventType,
    eventName,
    amount,
    currency = "EGP",
    paymentMethod,
    date = new Date(),
    transactionId,
  } = params || {};

  if (!to) throw new Error("sendPaymentReceiptEmail: 'to' is required");
  const safeName = name || "Participant";
  const safeEventType = (eventType || "event").toString();
  const safeEventName = eventName || "";
  const paidAt = new Date(date);
  const formattedDate = isNaN(paidAt.getTime())
    ? new Date().toLocaleString()
    : paidAt.toLocaleString();
  const method = paymentMethod || "Payment";
  const amountText =
    typeof amount === "number" && !isNaN(amount)
      ? `${amount.toFixed(2)} ${currency}`
      : `N/A ${currency}`;

  const txnLine = transactionId
    ? `<p style="margin:4px 0;color:#555;">Transaction ID: <strong>${transactionId}</strong></p>`
    : "";

  const subject = `Payment receipt for your ${safeEventType}`;
  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #222;">
      <p>Dear ${safeName},</p>
      <p>Thank you for your ${method.toLowerCase()} for the ${safeEventType}${
    safeEventName ? ` "<strong>${safeEventName}</strong>"` : ""
  }. This email confirms that your payment has been received.</p>
      <div style="border:1px solid #eee; padding:12px; border-radius:8px; background:#fafafa; margin: 12px 0;">
        <p style="margin:4px 0;color:#555;">Event: <strong>${
          safeEventName || safeEventType
        }</strong></p>
        <p style="margin:4px 0;color:#555;">Amount: <strong>${amountText}</strong></p>
        <p style="margin:4px 0;color:#555;">Payment method: <strong>${method}</strong></p>
        <p style="margin:4px 0;color:#555;">Paid at: <strong>${formattedDate}</strong></p>
        ${txnLine}
      </div>
      <p>If you have any questions, please reply to this email.</p>
      <p>Best regards,<br/>GUC Events Team</p>
    </div>
  `;

  return await sendEmail(to, subject, html, true);
};

export const sendVendorCancellationEmail = async ({
  vendor,
  request,
  isAuto = false,
}) => {
  if (!vendor || !vendor.email) {
    throw new Error(
      "Invalid vendor information for sending cancellation email"
    );
  }
  const eventLabel = request?.isBazarBooth
    ? request?.bazarId?.bazaarname ||
      request?.boothname ||
      "Bazaar booth participation"
    : request?.boothname || "Platform booth";

  const subject = isAuto
    ? "Participation auto-cancelled due to missed payment deadline"
    : "Your participation request has been cancelled";

  const intro = isAuto
    ? `We did not receive payment before the deadline, so your participation for <strong>${eventLabel}</strong> was automatically cancelled.`
    : `This email confirms that your participation request for <strong>${eventLabel}</strong> has been cancelled as requested.`;

  const html = `
    <p>Dear ${vendor.companyname || "Vendor"},</p>
    <p>${intro}</p>
    ${reasonLine}
    <p>If you would like to participate again, you can submit a new application at any time.</p>
    <p>Best regards,<br/>GUC Events Team</p>
  `;

  return await sendEmail(vendor.email, subject, html, true);
};

export const sendCommentDeletionNotification = async (
  deletedComment,
  event
) => {
  if (!deletedComment || !deletedComment.userId || !event) {
    throw new Error(
      "Invalid information for sending comment deletion notification"
    );
  }
  const user = await User.findById(deletedComment.userId);
  const eventsOffice = await EventsOffice.find();
  const subject = "Comment Deletion Notification";
  let text = `Dear User,\n\n`;
  text += `We would like to inform you that your comment "${
    deletedComment.comment
  }" on the event "${
    event.bazaarname ||
    event.boothname ||
    event.conferencename ||
    event.tripname ||
    event.workshopname ||
    ""
  }" has been deleted by the administrators for being inappropriate.\n\n`;
  text += `If you have any questions or concerns, please feel free to reach out to us.\n\n`;
  text += `Best regards,\nGUC Events Team`;
  return await sendEmail(
    user.email,
    subject,
    text,
    false,
    [],
    eventsOffice.map((eo) => eo.email)
  );
};

export const sendCertificate = async (email, name, workshop, subject) => {
  const issueDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const htmlBody = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">

            <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                
                <h2>Congratulations on Your Successful Attendance!</h2>
                
                <p>Dear **${name}**, </p>
                
                <p>We are thrilled to confirm your successful attendance and completion of the **${workshop}** workshop.</p>
                
                <p>Your dedication and participation are greatly appreciated. Please find your Certificate of Attendance below:</p>
                
                <div style="border: 5px solid #004085; padding: 30px; margin: 30px 0; text-align: center; background-color: #f8f9fa; border-radius: 10px;">
                    <h1 style="color: #004085; margin-bottom: 5px; font-size: 24px;">CERTIFICATE OF ATTENDANCE</h1>
                    <p style="font-size: 14px; color: #555;">IS PROUDLY PRESENTED TO</p>
                    <h2 style="color: #007bff; font-size: 36px; margin: 10px 0;">**${name}**</h2>
                    <p style="font-size: 16px; color: #555;">For successfully completing the workshop:</p>
                    <h3 style="color: #28a745; font-size: 28px; margin-top: 5px;">**${workshop}**</h3>
                    <p style="font-size: 14px; margin-top: 20px;">Issued on: **${issueDate}**</p>
                    <div style="margin-top: 25px;">
                        <p style="font-style: italic; color: #6c757d; border-top: 1px solid #ccc; display: inline-block; padding-top: 5px;">[Signature/Name of Workshop Coordinator/Organization]</p>
                    </div>
                </div>

                <p>Thank you once again for your commitment to learning.</p>
                
                <p>Best regards,</p>
                <p>GUC Events</p>
            </div>

        </body>
        </html>
    `;

  return await sendEmail(email, subject, htmlBody, true, [], []);
};
