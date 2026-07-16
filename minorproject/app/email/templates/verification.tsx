interface VerificationEmailTemplateProps {
  username: string;
  verifyCode: string;
}

export const verificationEmailTemplate = ({ username, verifyCode }: VerificationEmailTemplateProps) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Email Verification</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:40px auto;background-color:#ffffff;padding:30px;border-radius:8px;box-shadow:0 4px 8px rgba(0,0,0,0.1);">
          <h1 style="color:#333333;font-size:24px;">Email Verification</h1>
          <p style="color:#555555;font-size:16px;line-height:1.5;">Hi ${username},</p>
          <p style="color:#555555;font-size:16px;line-height:1.5;">
            Thank you for registering with us! Please use the verification code below to complete your sign-up process:
          </p>
          <div style="display:inline-block;padding:10px 20px;margin:20px 0;font-size:20px;font-weight:bold;color:#ffffff;background-color:#0070f3;border-radius:6px;letter-spacing:2px;">
            ${verifyCode}
          </div>
          <p style="color:#555555;font-size:16px;line-height:1.5;">
            If you did not create an account, you can safely ignore this email.
          </p>
          <div style="margin-top:30px;font-size:12px;color:#999999;">
            &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
          </div>
      </div>
  </body>
  </html>
  `;
};
