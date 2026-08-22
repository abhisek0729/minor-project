# Email Configuration Guide

## Overview
This project uses **Resend** for sending verification emails. Resend is a modern email API service.

## Setup Steps

### 1. Create a Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key
1. Log in to your Resend dashboard
2. Navigate to "API Keys" section
3. Copy your API key

### 3. Configure Environment Variables
Add the following to your `.env.local` file:

```env
RESEND_API_KEY=your_api_key_here
RESEND_FROM_EMAIL="TravelNepal <noreply@your-verified-domain.com>"
```

Replace `your_api_key_here` with the actual API key from Resend.
Replace `noreply@your-verified-domain.com` with an email address from a domain you have verified in Resend.

### 4. Set Up a Sender Email
- **Development/testing**: `onboarding@resend.dev` only works for Resend test recipients like `delivered@resend.dev`
- **Real users**: Add and verify your own domain in Resend, then set `RESEND_FROM_EMAIL` to that verified sender

For production, the app uses `RESEND_FROM_EMAIL` in [app/email/send-email.ts](app/email/send-email.ts):
```typescript
from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
```

## Verification Email Flow

1. User registers with email and role
2. System generates a 6-digit verification code
3. Resend sends the verification email with the code
4. User receives email and enters the code on the verify page
5. System verifies the code and marks the email as verified

## Troubleshooting

### Email not received?
1. Check spam/junk folder
2. Verify email address is correct
3. Check RESEND_API_KEY is set in `.env.local`
4. Check console logs for error messages

### "Email service not configured" error
- Ensure `RESEND_API_KEY` is set in `.env.local`
- Restart the development server after adding environment variables

### "Resend test sender can only send to Resend test addresses" error
- That means `onboarding@resend.dev` is still being used
- Verify your own domain in Resend
- Set `RESEND_FROM_EMAIL` to a verified sender from that domain

### Rate limiting
- Resend has rate limits on free tier
- Wait a few minutes before sending another verification code

## Database Schema
- Verification codes are stored in `users` table
- Fields: `verify_code` and `verify_code_expiry`
- Codes expire after 1 hour

## Files Modified
- [app/email/send-email.ts](app/email/send-email.ts) - Email sending service
- [app/api/auth/verify-email/resend/route.ts](app/api/auth/verify-email/resend/route.ts) - Resend verification code endpoint
- [app/features/auth/components/VerifyEmailForm.tsx](app/features/auth/components/VerifyEmailForm.tsx) - UI with resend button
