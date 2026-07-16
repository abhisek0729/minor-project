import { Resend } from "resend";
import { verificationEmailTemplate } from "./templates/verification";
import { ApiResponse } from "../types/api";
import { use } from "react";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string,
): Promise<ApiResponse> {

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Verification Code for Your Account",
      html: verificationEmailTemplate({ username, verifyCode }),
    });

    return {
      success: true,
      message: "Verification email sent successfully.",
    };
  } catch (emailError) {
    console.log("Error sending verification email:", emailError);
    return {
      success: false,
      message: "Failed to send verification email.",
    };
  }
}
