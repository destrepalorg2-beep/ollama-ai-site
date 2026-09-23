/**
 * Sends the registration verification-code email via SMTP (Nodemailer).
 * Server-side only. Reuses the same SMTP_* env vars / Gmail account the
 * desktop app (ai hub) already uses, so it's one mailbox to manage, and the
 * email itself is restyled to match this site's actual purple branding
 * instead of ai hub's.
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
<body style="margin:0;padding:0;background:#0f0f1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:32px 16px;">
    <div style="background:#16162a;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
      <div style="background:linear-gradient(135deg,#7c3aed 0%,#a855f7 100%);padding:36px 32px;text-align:center;">
        <div style="font-size:36px;margin-bottom:8px;">🤖</div>
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">AI HUB</h1>
        <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px;">Код подтверждения email</p>
      </div>
      <div style="padding:36px 32px;text-align:center;">
        <p style="color:#e4e4e7;font-size:16px;line-height:1.6;margin:0 0 24px;">
          Здравствуйте! Чтобы завершить регистрацию в AI HUB, введите этот код на сайте:
        </p>
        <div style="background:rgba(124,58,237,0.12);border:2px dashed #7c3aed;border-radius:16px;padding:24px;margin:0 auto 24px;max-width:320px;">
          <div style="font-size:40px;font-weight:900;letter-spacing:8px;color:#a78bfa;">${code}</div>
        </div>
        <p style="color:#9ca3af;font-size:13px;line-height:1.6;margin:0 0 8px;">
          Код действителен 15 минут. Если вы не регистрировались в AI HUB — просто проигнорируйте это письмо.
        </p>
      </div>
      <div style="padding:24px 32px;text-align:center;background:#111120;border-top:1px solid rgba(255,255,255,0.06);">
        <p style="color:#6b7280;font-size:12px;margin:0;">Команда AI HUB</p>
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
