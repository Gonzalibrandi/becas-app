import nodemailer from "nodemailer";

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

if (!SMTP_USER || !SMTP_PASS) {
  console.warn("⚠️ SMTP_USER / SMTP_PASS not set — emails will not be sent.");
}

const transporter =
  SMTP_USER && SMTP_PASS
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      })
    : null;

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  if (!transporter || !SMTP_USER) {
    console.warn("SMTP not configured. Skipping email.");
    return false;
  }

  try {
    await transporter.sendMail({
      from: `Becas App <${SMTP_USER}>`,
      to,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}
