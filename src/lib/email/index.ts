import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const from = process.env.EMAIL_FROM || "noreply@example.com";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<boolean> {
  if (!resend) {
    console.log(`[DEV EMAIL] To: ${to}, Subject: ${subject}`);
    return true;
  }

  try {
    await resend.emails.send({ from, to, subject, html });
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

export function invitationEmail(teamName: string, inviterName: string, link: string) {
  return {
    subject: `You've been invited to join ${teamName} on CoFounder`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>Partnership Invitation</h2>
        <p>${inviterName} has invited you to join <strong>${teamName}</strong> on CoFounder.</p>
        <p>CoFounder helps co-founder teams assess compatibility, track partnership health, and discover the right venture to build together.</p>
        <a href="${link}" style="display: inline-block; background: #18181b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
          Accept Invitation
        </a>
        <p style="color: #71717a; font-size: 14px;">This invitation expires in 7 days.</p>
      </div>
    `,
  };
}

export function assessmentReminderEmail(teamName: string, link: string) {
  return {
    subject: `Reminder: Complete your assessment for ${teamName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>Assessment Reminder</h2>
        <p>Your partners are waiting! Complete your partnership assessment for <strong>${teamName}</strong>.</p>
        <a href="${link}" style="display: inline-block; background: #18181b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
          Continue Assessment
        </a>
      </div>
    `,
  };
}

export function reportReadyEmail(teamName: string, link: string) {
  return {
    subject: `Your compatibility report for ${teamName} is ready`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>Report Ready</h2>
        <p>Great news! Your compatibility report for <strong>${teamName}</strong> has been generated.</p>
        <a href="${link}" style="display: inline-block; background: #18181b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
          View Report
        </a>
      </div>
    `,
  };
}
