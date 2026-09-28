/**
 * Sends the registration verification-code email via SMTP (Nodemailer).
 * Server-side only. Reuses the same SMTP_* env vars / Gmail account the
 * desktop app (ai hub) already uses, so it's one mailbox to manage. Styled
 * to match the actual product look — the site's own auth pages (/login,
 * /register, /verify) and the desktop app's panel, both neutral black/white
 * with individually bordered OTP digit boxes — not the purple/violet the
 * marketing landing page uses elsewhere, and not a generic light
 * transactional template either.
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
  // Matches the ACTUAL product look — the site's own auth pages (/login,
  // /register, /verify) and the desktop app's panel are neutral black/white
  // (see .app-theme in globals.css and InputOtp10's individual bordered
  // digit slots), not the purple/violet the rest of the marketing site uses.
  // The previous version of this template used that purple, which is why it
  // looked like it belonged to a different product — this one reuses the
  // exact tokens: #050506 background, white text, rgba(255,255,255,.08-.16)
  // borders, one bordered box per digit instead of a single purple block.
  const digits = String(code).split('');
  const digitCells = digits
    .map(
      (d, i) =>
        `<td style="width:42px;height:52px;border:1px solid rgba(255,255,255,0.18);background:rgba(255,255,255,0.05);border-radius:12px;text-align:center;vertical-align:middle;font-family:'SFMono-Regular',Consolas,Menlo,monospace;font-size:21px;font-weight:700;color:#ffffff;">${d}</td>${
          i < digits.length - 1 ? '<td style="width:8px;"></td>' : ''
        }`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Код подтверждения — AI HUB</title>
</head>
<body style="margin:0;padding:0;background:#050506;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#050506;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#0b0b0d;border:1px solid rgba(255,255,255,0.08);border-radius:16px;">
          <tr>
            <td style="padding:26px 32px;border-bottom:1px solid rgba(255,255,255,0.08);">
              <span style="color:#ffffff;font-size:16px;font-weight:700;letter-spacing:0.04em;">AI HUB</span>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 8px;">
              <h1 style="margin:0 0 12px;color:#ffffff;font-size:19px;font-weight:600;">Подтверждение почты</h1>
              <p style="margin:0;color:rgba(255,255,255,0.55);font-size:14px;line-height:1.6;">
                Введите этот код на странице подтверждения, чтобы завершить вход в AI HUB:
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto;">
                <tr>${digitCells}</tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;">
              <p style="margin:0 0 4px;color:rgba(255,255,255,0.4);font-size:13px;line-height:1.6;">
                Код действителен 15 минут. Никому его не сообщайте.
              </p>
              <p style="margin:0;color:rgba(255,255,255,0.28);font-size:13px;line-height:1.6;">
                Не регистрировались в AI HUB? Просто проигнорируйте это письмо.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.08);">
              <p style="margin:0;color:rgba(255,255,255,0.28);font-size:12px;">© AI HUB</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
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
