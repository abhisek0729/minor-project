import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/app/types/api";
import { db } from "@/app/lib/db";
import { usersTable } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendVerificationEmail } from "@/app/email/send-email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Email is required",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, normalizedEmail));

    if (!user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Email not found",
        },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Email is already verified",
        },
        { status: 400 }
      );
    }

    // Generate new verification code
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyCodeExpiry = new Date();
    verifyCodeExpiry.setHours(verifyCodeExpiry.getHours() + 1);

    // Update user with new verification code
    await db
      .update(usersTable)
      .set({
        verifyCode: verifyCode,
        verifyCodeExpiry: verifyCodeExpiry,
      })
      .where(eq(usersTable.id, user.id));

    // Send verification email
    const emailResult = await sendVerificationEmail(
      normalizedEmail,
      user.name,
      verifyCode
    );

    if (!emailResult.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: emailResult.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "Verification code sent successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error resending verification email:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Failed to resend verification email",
      },
      { status: 500 }
    );
  }
}
