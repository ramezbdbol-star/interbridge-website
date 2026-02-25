import nodemailer from "nodemailer";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim() || "interbridge.mira@gmail.com";
const ADMIN_PHONE = "+86 15325467680";

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  interestedIn: string;
  message: string;
}

interface BookingAdminNotificationData {
  bookingId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  purpose: string | null;
  notes: string | null;
  isUrgent: boolean;
  needsMeetLink: boolean;
  visitorTimezone: string;
  startAtUtc: Date;
  endAtUtc: Date;
  holdExpiresAt: Date;
  approveUrl: string;
  rejectUrl: string;
}

interface BookingApprovalConfirmationData {
  email: string;
  name: string | null;
  startAtUtc: Date;
  endAtUtc: Date;
  visitorTimezone: string;
  isUrgent: boolean;
  needsMeetLink: boolean;
}

function getTransporter() {
  const appPassword = process.env.GMAIL_APP_PASSWORD;
  if (!appPassword) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: ADMIN_EMAIL,
      pass: appPassword,
    },
  });
}

function formatDate(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export async function sendContactNotification(data: ContactFormData): Promise<boolean> {
  const transporter = getTransporter();

  if (!transporter) {
    console.log("Email notification skipped: GMAIL_APP_PASSWORD not configured");
    console.log("New contact request received:", data);
    return false;
  }

  try {
    const serviceLabels: Record<string, string> = {
      sourcing: "Sourcing & Screening",
      oem: "OEM/ODM Project",
      interpretation: "Interpretation/Visit",
      qc: "Quality Control Only",
      other: "Other",
    };

    const interestedLabel = serviceLabels[data.interestedIn] || data.interestedIn;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e3a5f; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">New Contact Request</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">InterBridge Trans & Trade</p>
        </div>

        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1e3a5f; margin-top: 0;">Contact Details</h2>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; width: 140px;">Name:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">${data.firstName} ${data.lastName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Email:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                <a href="mailto:${data.email}" style="color: #2563eb;">${data.email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Interested In:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">${interestedLabel}</td>
            </tr>
          </table>

          <h3 style="color: #1e3a5f; margin-top: 25px;">Message</h3>
          <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <p style="margin: 0; white-space: pre-wrap;">${data.message}</p>
          </div>
        </div>

        <div style="background: #1e3a5f; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">This is an automated notification from your InterBridge website.</p>
        </div>
      </div>
    `;

    const emailText = `
New Contact Request - InterBridge Trans & Trade

Contact Details:
- Name: ${data.firstName} ${data.lastName}
- Email: ${data.email}
- Interested In: ${interestedLabel}

Message:
${data.message}

---
This is an automated notification from your InterBridge website.
    `;

    await transporter.sendMail({
      from: `InterBridge <${ADMIN_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `New Inquiry from ${data.firstName} ${data.lastName} - InterBridge`,
      html: emailHtml,
      text: emailText,
    });

    console.log("Email notification sent successfully to", ADMIN_EMAIL);
    return true;
  } catch (error: any) {
    console.error("Failed to send email notification:", error?.message || error);
    return false;
  }
}

export async function sendBookingAdminNotification(data: BookingAdminNotificationData): Promise<boolean> {
  const transporter = getTransporter();

  if (!transporter) {
    console.log("Booking admin email skipped: GMAIL_APP_PASSWORD not configured");
    console.log("New booking request:", data);
    return false;
  }

  try {
    const startShanghai = formatDate(data.startAtUtc, "Asia/Shanghai");
    const endShanghai = formatDate(data.endAtUtc, "Asia/Shanghai");
    const startVisitor = formatDate(data.startAtUtc, data.visitorTimezone);
    const endVisitor = formatDate(data.endAtUtc, data.visitorTimezone);

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
        <div style="background: #0f172a; color: white; padding: 18px 22px;">
          <h2 style="margin: 0; font-size: 20px;">New Book Now Request</h2>
          <p style="margin: 6px 0 0; opacity: 0.9;">ID: ${data.bookingId}</p>
        </div>

        <div style="padding: 20px 22px; background: #ffffff;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 8px 0; font-weight: bold; width: 170px;">Name</td><td>${data.name || "(not provided)"}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Email</td><td>${data.email || "(not provided)"}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Phone</td><td>${data.phone || "(not provided)"}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Purpose</td><td>${data.purpose || "(not provided)"}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Urgent</td><td>${data.isUrgent ? "Yes" : "No"}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Needs Google Meet</td><td>${data.needsMeetLink ? "Yes" : "No"}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Shanghai Time</td><td>${startShanghai} - ${endShanghai}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Visitor Time (${data.visitorTimezone})</td><td>${startVisitor} - ${endVisitor}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Hold Expires</td><td>${formatDate(data.holdExpiresAt, "Asia/Shanghai")} (Asia/Shanghai)</td></tr>
          </table>

          <div style="margin-top: 16px; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            <strong>Notes:</strong>
            <div style="margin-top: 6px; white-space: pre-wrap;">${data.notes || "(not provided)"}</div>
          </div>

          <div style="margin-top: 20px; display: flex; gap: 12px; flex-wrap: wrap;">
            <a href="${data.approveUrl}" style="background: #16a34a; color: white; text-decoration: none; padding: 10px 14px; border-radius: 8px; font-weight: bold;">Approve Booking</a>
            <a href="${data.rejectUrl}" style="background: #dc2626; color: white; text-decoration: none; padding: 10px 14px; border-radius: 8px; font-weight: bold;">Reject Booking</a>
          </div>
        </div>
      </div>
    `;

    const text = [
      "New Book Now Request",
      `Booking ID: ${data.bookingId}`,
      `Name: ${data.name || "(not provided)"}`,
      `Email: ${data.email || "(not provided)"}`,
      `Phone: ${data.phone || "(not provided)"}`,
      `Purpose: ${data.purpose || "(not provided)"}`,
      `Urgent: ${data.isUrgent ? "Yes" : "No"}`,
      `Needs Google Meet: ${data.needsMeetLink ? "Yes" : "No"}`,
      `Shanghai Time: ${startShanghai} - ${endShanghai}`,
      `Visitor Time (${data.visitorTimezone}): ${startVisitor} - ${endVisitor}`,
      `Hold Expires: ${formatDate(data.holdExpiresAt, "Asia/Shanghai")} (Asia/Shanghai)`,
      `Notes: ${data.notes || "(not provided)"}`,
      "",
      `Approve: ${data.approveUrl}`,
      `Reject: ${data.rejectUrl}`,
    ].join("\n");

    await transporter.sendMail({
      from: `InterBridge <${ADMIN_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `Book Now Request - ${data.name || data.email || data.phone || data.bookingId}`,
      html,
      text,
    });

    return true;
  } catch (error: any) {
    console.error("Failed to send booking admin notification:", error?.message || error);
    return false;
  }
}

export async function sendBookingApprovalConfirmation(
  data: BookingApprovalConfirmationData,
): Promise<boolean> {
  const transporter = getTransporter();

  if (!transporter) {
    console.log("Booking approval email skipped: GMAIL_APP_PASSWORD not configured");
    return false;
  }

  try {
    const startVisitor = formatDate(data.startAtUtc, data.visitorTimezone);
    const endVisitor = formatDate(data.endAtUtc, data.visitorTimezone);

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
        <div style="background: #14532d; color: white; padding: 20px;">
          <h2 style="margin: 0;">Your Booking Is Confirmed</h2>
        </div>
        <div style="padding: 20px; background: #ffffff;">
          <p>Hello ${data.name || "there"},</p>
          <p>Your Book Now request has been approved. A Google Calendar invite has been sent to this email.</p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr><td style="padding: 8px 0; font-weight: bold; width: 180px;">Scheduled Time</td><td>${startVisitor} - ${endVisitor}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Timezone</td><td>${data.visitorTimezone}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Urgent Booking</td><td>${data.isUrgent ? "Yes" : "No"}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Google Meet Requested</td><td>${data.needsMeetLink ? "Yes" : "No"}</td></tr>
          </table>

          <p style="margin-top: 18px;">If you need to change this booking, please reply to this email or contact us directly.</p>
          <p style="margin-top: 18px;">Regards,<br/>InterBridge Team</p>
        </div>
      </div>
    `;

    const text = [
      "Your booking is confirmed.",
      `Scheduled time: ${startVisitor} - ${endVisitor}`,
      `Timezone: ${data.visitorTimezone}`,
      `Urgent booking: ${data.isUrgent ? "Yes" : "No"}`,
      `Google Meet requested: ${data.needsMeetLink ? "Yes" : "No"}`,
      "A Google Calendar invite has been sent to your email.",
      "If you need changes, reply to this email.",
    ].join("\n");

    await transporter.sendMail({
      from: `InterBridge <${ADMIN_EMAIL}>`,
      to: data.email,
      subject: "Your Book Now Request Is Confirmed",
      html,
      text,
    });

    return true;
  } catch (error: any) {
    console.error("Failed to send booking approval confirmation:", error?.message || error);
    return false;
  }
}

export { ADMIN_EMAIL, ADMIN_PHONE };
