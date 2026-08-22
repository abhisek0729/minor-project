import { Resend } from "resend";
import { verificationEmailTemplate } from "./templates/verification";
import { approvalEmailTemplate } from "./templates/approval";
import { ApiResponse } from "../types/api";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string,
): Promise<ApiResponse> {

  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return {
        success: false,
        message: "Email service not configured. Please contact support.",
      };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Verification Code for Your Account",
      html: verificationEmailTemplate({ username, verifyCode }),
    });

    if (error) {
      console.error("Resend API error:", {
        message: error.message,
        name: error.name,
        statusCode: (error as { statusCode?: number }).statusCode,
        details: error,
      });

      const resendDevRestriction =
        fromEmail.includes("resend.dev") &&
        email !== "delivered@resend.dev" &&
        email !== "bounced@resend.dev" &&
        email !== "complained@resend.dev" &&
        email !== "suppressed@resend.dev";

      return {
        success: false,
        message: resendDevRestriction
          ? "Resend test sender can only send to Resend test addresses. Verify your own domain and set RESEND_FROM_EMAIL to a verified sender."
          : `Failed to send verification email. ${error.message}`,
      };
    }

    console.log("Verification email sent successfully to:", email);
    return {
      success: true,
      message: "Verification email sent successfully.",
    };
  } catch (emailError) {
    console.error("Error sending verification email:", emailError);
    return {
      success: false,
      message: "Failed to send verification email.",
    };
  }
}

export async function sendApprovalNotificationEmail({
  email,
  ownerName,
  businessName,
  businessType,
  status,
}: {
  email: string;
  ownerName: string;
  businessName: string;
  businessType: "Hotel" | "Restaurant" | "Tour Guide";
  status: "approved" | "rejected";
}): Promise<ApiResponse> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured. Skipping approval notification email.");
      return { success: true, message: "Skipped email (no API key)" };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const dashboardUrl = `${baseUrl}/dashboard`;

    const subject =
      status === "approved"
        ? `🎉 Approved! Your ${businessType} Workspace (${businessName}) is Live on TravelNepal`
        : `Update regarding your ${businessType} Workspace Application (${businessName})`;

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject,
      html: approvalEmailTemplate({
        ownerName,
        businessName,
        businessType,
        status,
        dashboardUrl,
      }),
    });

    if (error) {
      console.error("Failed to send approval email via Resend:", error);
      return { success: false, message: error.message };
    }

    console.log(`[EMAIL] Approval notification email sent to ${email} for ${businessName} (${status})`);
    return { success: true, message: "Approval notification email sent successfully" };
  } catch (error: any) {
    console.error("Error in sendApprovalNotificationEmail:", error);
    return { success: false, message: error?.message || "Failed to send email" };
  }
}

