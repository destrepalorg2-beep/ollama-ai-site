/**
 * Sends the registration verification-code email via SMTP (Nodemailer).
 * Server-side only. Reuses the same SMTP_* env vars / Gmail account the
 * desktop app (ai hub) already uses, so it's one mailbox to manage. Styled
 * to match the site's own dark, purple-accented look rather than a generic
 * light transactional template.
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
<body style="margin:0;padding:0;background:#0b0b16;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:40px 16px;">
    <div style="background:linear-gradient(180deg,#15121f 0%,#0e0c16 100%);border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">

      <div style="padding:28px 32px;border-bottom:1px solid rgba(255,255,255,0.08);">
        <span style="color:#ffffff;font-size:17px;font-weight:700;letter-spacing:0.02em;">AI HUB</span>
      </div>

      <div style="padding:36px 32px;">
        <h1 style="color:#ffffff;margin:0 0 12px;font-size:19px;font-weight:600;">Подтверждение email</h1>
        <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;margin:0 0 28px;">
          Здравствуйте! Введите этот код на странице подтверждения, чтобы завершить регистрацию в AI HUB:
        </p>

        <div style="background:rgba(139,92,246,0.12);border:1px solid rgba(139,92,246,0.35);border-radius:12px;padding:22px;text-align:center;margin:0 0 28px;">
          <span style="font-family:'SFMono-Regular',Consolas,Menlo,monospace;font-size:34px;font-weight:700;letter-spacing:8px;color:#c4b5fd;">${code}</span>
        </div>

        <p style="color:rgba(255,255,255,0.45);font-size:13px;line-height:1.6;margin:0 0 4px;">
          Код действителен 15 минут. Никому его не сообщайте.
        </p>
        <p style="color:rgba(255,255,255,0.3);font-size:13px;line-height:1.6;margin:0;">
          Не регистрировались в AI HUB? Просто проигнорируйте это письмо.
        </p>
      </div>

      <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.08);">
        <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0;">© AI HUB</p>
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
