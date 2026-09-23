/**
 * Sends the registration verification-code email via SMTP (Nodemailer).
 * Server-side only. Reuses the same SMTP_* env vars / Gmail account the
 * desktop app (ai hub) already uses, so it's one mailbox to manage. Kept
 * deliberately plain/neutral (light background, one accent color) rather
 * than mirroring the site's dark purple look — a simple transactional
 * email reads better across mail clients and doesn't trip spam filters
 * as easily as a heavily styled one.
 */

import nodemailer from 'nodemailer';

function isConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!isConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    });
  }
  return transporter;
}

function buildVerificationEmailHtml(code: string): string {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Код подтверждения</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">

      <div style="padding:28px 32px;border-bottom:1px solid #e4e4e7;">
        <span style="color:#18181b;font-size:16px;font-weight:700;">AI HUB</span>
      </div>

      <div style="padding:32px;">
        <h1 style="color:#18181b;margin:0 0 12px;font-size:18px;font-weight:600;">Подтверждение email</h1>
        <p style="color:#52525b;font-size:14px;line-height:1.6;margin:0 0 24px;">
          Здравствуйте! Введите этот код на странице подтверждения, чтобы завершить регистрацию в AI HUB:
        </p>

        <div style="background:#f4f4f5;border-radius:8px;padding:20px;text-align:center;margin:0 0 24px;">
          <span style="font-family:'SFMono-Regular',Consolas,Menlo,monospace;font-size:32px;font-weight:700;letter-spacing:6px;color:#18181b;">${code}</span>
        </div>

        <p style="color:#71717a;font-size:13px;line-height:1.6;margin:0 0 4px;">
          Код действителен 15 минут. Никому его не сообщайте.
        </p>
        <p style="color:#a1a1aa;font-size:13px;line-height:1.6;margin:0;">
          Не регистрировались в AI HUB? Просто проигнорируйте это письмо.
        </p>
      </div>

      <div style="padding:16px 32px;border-top:1px solid #e4e4e7;">
        <p style="color:#a1a1aa;font-size:12px;margin:0;">© AI HUB</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Sends the code, or — when SMTP isn't configured yet — logs it instead of
 * throwing, so registration doesn't hard-fail while SMTP is being set up.
 * Returns true if an actual email went out.
 */
export async function sendVerificationEmail(to: string, code: string): Promise<boolean> {
  const t = getTransporter();
  if (!t) {
    console.warn(`SMTP not configured — verification code for ${to}: ${code}`);
    return false;
  }
  const fromName = process.env.SMTP_FROM_NAME || 'AI HUB';
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
  await t.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: `Ваш код подтверждения: ${code}`,
    html: buildVerificationEmailHtml(code),
  });
  return true;
}
