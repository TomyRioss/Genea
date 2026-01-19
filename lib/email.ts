import { Resend } from "resend"
import nodemailer from "nodemailer"

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

async function getTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }
  const testAccount = await nodemailer.createTestAccount()
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  })
  return transporter
}

export async function sendVerificationEmail(
  email: string,
  code: string
): Promise<void> {
  const subject = "Verifica tu email - Genea"
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f0f9ff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9ff; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%); padding: 32px 40px; border-radius: 16px 16px 0 0; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Genea</h1>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 12px 0; color: #0c4a6e; font-size: 22px; font-weight: 600; text-align: center;">Verificación de Email</h2>
                  <p style="margin: 0 0 28px 0; color: #64748b; font-size: 15px; line-height: 1.6; text-align: center;">Ingresá el siguiente código para verificar tu cuenta:</p>
                  <!-- Code Box -->
                  <div style="background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%); border: 2px solid #7dd3fc; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 28px 0;">
                    <span style="font-size: 36px; font-weight: 700; letter-spacing: 10px; color: #0369a1;">${code}</span>
                  </div>
                  <p style="margin: 0; color: #94a3b8; font-size: 13px; text-align: center;">Este código expira en <strong style="color: #0ea5e9;">15 minutos</strong></p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding: 24px 40px; background-color: #f8fafc; border-radius: 0 0 16px 16px; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center; line-height: 1.5;">Si no solicitaste este código, podés ignorar este email.</p>
                  <p style="margin: 12px 0 0 0; color: #cbd5e1; font-size: 11px; text-align: center;">&copy; 2025 Genea. Todos los derechos reservados.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  if (resend) {
    await resend.emails.send({
      from: "noreply@geneaapp.com",
      to: email,
      subject,
      html,
    })
  } else {
    const transporter = await getTransporter()
    const fromEmail = process.env.SMTP_USER || "noreply@genea.com"
    const info = await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject,
      html,
    })
    const previewUrl = nodemailer.getTestMessageUrl(info)
    if (previewUrl) {
      console.log("Email preview URL:", previewUrl)
    }
  }
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
