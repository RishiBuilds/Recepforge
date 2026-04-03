"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Resend } from "resend";

const notificationTypeValues = v.union(
  v.literal("appointment_created"),
  v.literal("appointment_confirmed"),
  v.literal("appointment_cancelled"),
  v.literal("appointment_reminder"),
  v.literal("status_changed")
);

function buildEmailHtml(args: {
  patientName: string;
  title: string;
  message: string;
  type: string;
}): string {
  const typeColors: Record<string, { accent: string; bg: string }> = {
    appointment_created: { accent: "#0d9488", bg: "#f0fdfa" },
    appointment_confirmed: { accent: "#0d9488", bg: "#f0fdfa" },
    appointment_cancelled: { accent: "#ef4444", bg: "#fef2f2" },
    appointment_reminder: { accent: "#f59e0b", bg: "#fffbeb" },
    status_changed: { accent: "#6366f1", bg: "#eef2ff" },
  };

  const colors = typeColors[args.type] || typeColors.appointment_created;

  const typeLabels: Record<string, string> = {
    appointment_created: "Appointment Confirmed",
    appointment_confirmed: "Appointment Confirmed",
    appointment_cancelled: "Appointment Cancelled",
    appointment_reminder: "Appointment Reminder",
    status_changed: "Appointment Update",
  };

  const typeIcons: Record<string, string> = {
    appointment_created: "✅",
    appointment_confirmed: "✅",
    appointment_cancelled: "❌",
    appointment_reminder: "🔔",
    status_changed: "🔄",
  };

  const label = typeLabels[args.type] || "Notification";
  const icon = typeIcons[args.type] || "📧";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${label}</title>
</head>
<body style="margin:0; padding:0; background-color:#f8fafc; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc; padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:16px; box-shadow:0 4px 24px rgba(15,23,42,0.08); overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${colors.accent},#0f766e); padding:32px 40px; text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="width:48px; height:48px; border-radius:12px; background:rgba(255,255,255,0.2); display:inline-block; line-height:48px; font-size:24px; margin-bottom:12px;">
                      ${icon}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="color:#ffffff; font-size:22px; font-weight:700; letter-spacing:-0.02em; padding-top:8px;">
                    ${label}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 8px; font-size:14px; color:#64748b; font-weight:500; text-transform:uppercase; letter-spacing:0.05em;">
                Hello,
              </p>
              <p style="margin:0 0 24px; font-size:18px; color:#0f172a; font-weight:600;">
                ${args.patientName}
              </p>

              <div style="background:${colors.bg}; border-radius:12px; padding:20px 24px; border-left:4px solid ${colors.accent};">
                <p style="margin:0 0 8px; font-size:15px; font-weight:600; color:#0f172a;">
                  ${args.title}
                </p>
                <p style="margin:0; font-size:14px; color:#475569; line-height:1.6;">
                  ${args.message}
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:0 40px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e2e8f0; padding-top:20px;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px; font-size:13px; color:#94a3b8;">
                      If you have questions, please contact your clinic directly.
                    </p>
                    <p style="margin:0; font-size:12px; color:#cbd5e1;">
                      Sent via RecepForge — Modern Clinic Management
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export const sendNotificationEmail = internalAction({
  args: {
    notificationId: v.id("notifications"),
    to: v.string(),
    patientName: v.string(),
    subject: v.string(),
    title: v.string(),
    message: v.string(),
    type: notificationTypeValues,
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY not set — skipping email delivery");
      return;
    }

    const resend = new Resend(apiKey);

    const html = buildEmailHtml({
      patientName: args.patientName,
      title: args.title,
      message: args.message,
      type: args.type,
    });

    try {
      const { error } = await resend.emails.send({
        from: "RecepForge <onboarding@resend.dev>",
        to: [args.to],
        subject: args.subject,
        html,
      });

      if (error) {
        console.error("Resend API error:", error);
        return;
      }

      await ctx.runMutation(internal.notifications.markEmailSent, {
        notificationId: args.notificationId,
      });

      console.log(`Email sent to ${args.to}: ${args.subject}`);
    } catch (err) {
      console.error("Failed to send email:", err);
    }
  },
});
