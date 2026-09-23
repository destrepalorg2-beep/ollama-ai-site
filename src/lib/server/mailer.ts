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

/**
 * Six boxed digits, laid out as a <table> so the "code slots" look from the
 * /verify page survives Outlook/Gmail's CSS stripping — flexbox/grid and any
 * canvas/video/JS in the on-site widget can't be embedded in an email, so
 * this reproduces the same visual language (color, spacing, boxed digits)
 * with markup mail clients actually render consistently.
 */
function buildCodeBoxesHtml(code: string): string {
  const digits = code.split("");
  const cells = digits
    .map(
      (digit, i) => `
        <td style="width:44px;height:56px;border:2px solid rgba(124,58,237,0.55);background:rgba(124,58,237,0.14);border-radius:12px;text-align:center;vertical-align:middle;font-family:'SFMono-Regular',Consolas,Menlo,monospace;font-size:26px;font-weight:800;color:#c4b5fd;">${digit}</td>
        ${i < digits.length - 1 ? '<td style="width:8px;line-height:1px;font-size:1px;">&nbsp;</td>' : ""}`,
    )
    .join("");
  return `<table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr>${cells}</tr></table>`;
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
  <div style="max-width:520px;margin:0 auto;padding:32px 16px;">
    <div style="background:#14141f;border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">

      <div style="padding:40px 32px 28px;text-align:center;background:radial-gradient(circle at 50% 0%, rgba(124,58,237,0.35), transparent 65%);">
        <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:0 auto 18px;">
          <tr>
            <td style="width:64px;height:64px;border-radius:9999px;background:linear-gradient(135deg,#7c3aed,#a855f7);text-align:center;vertical-align:middle;font-size:28px;">🤖</td>
          </tr>
        </table>
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.02em;">AI HUB</h1>
        <p style="color:rgba(255,255,255,0.55);margin:8px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:0.14em;">Подтверждение email</p>
      </div>

      <div style="padding:4px 32px 36px;text-align:center;">
        <p style="color:#d4d4d8;font-size:15px;line-height:1.6;margin:0 0 28px;">
          Здравствуйте! Введите этот код на странице подтверждения, чтобы завершить регистрацию:
        </p>

        <div style="margin:0 0 28px;">
          ${buildCodeBoxesHtml(code)}
        </div>

        <p style="color:#71717a;font-size:12px;line-height:1.6;margin:0 0 4px;">
          Код действителен 15 минут. Никому его не сообщайте.
        </p>
        <p style="color:#52525b;font-size:12px;line-height:1.6;margin:0;">
          Не регистрировались в AI HUB? Просто проигнорируйте это письмо.
        </p>
      </div>

      <div style="padding:20px 32px;text-align:center;background:rgba(0,0,0,0.28);border-top:1px solid rgba(255,255,255,0.06);">
        <p style="color:#52525b;font-size:11px;margin:0;letter-spacing:0.05em;">© AI HUB — команда сервиса</p>
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
