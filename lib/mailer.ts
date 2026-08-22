import "server-only";
import nodemailer from "nodemailer";
import { env } from "@/core/config/env";
import { siteConfig } from "@/core/config";

export function isSmtpConfigured(): boolean {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
}

type MailInput = {
  to: string;
  subject: string;
  html: string;
};

/**
 * Sends an email via SMTP when configured; otherwise logs a mock mail to the
 * server console (same graceful behavior as the original Express server).
 * Never throws — a failed notification must not fail the order.
 */
export async function sendMail({ to, subject, html }: MailInput): Promise<void> {
  if (!isSmtpConfigured()) {
    console.log("------------------ [START OUTGOING MAIL] ------------------");
    console.log(`Subject: ${subject}`);
    console.log(`To: ${to}`);
    console.log("(SMTP not configured — mail logged instead of sent)");
    console.log("------------------ [END OUTGOING MAIL] ------------------");
    return;
  }

  try {
    const port = Number.parseInt(env.SMTP_PORT ?? "587", 10);
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"${siteConfig.name} Delivery" <${env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("[Mailer] SMTP send failed:", error);
  }
}
