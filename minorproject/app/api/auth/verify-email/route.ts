import { ApiResponse } from "@/app/types/api";
import { NextRequest, NextResponse } from "next/server";
import { verifySchema } from "@/app/features/auth/schemas/register.schema";
import { emailVerification } from "@/app/features/auth/services/verify-email.service";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const result = verifySchema.safeParse({ code: body.code });

    if (!result.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: "Invalid Verification Code",
      });
    }
    const decodedBody = {
      ...body,
      email: decodeURIComponent(body.email),
    };

    const verificationResult = await emailVerification(decodedBody);

    return NextResponse.json<ApiResponse>(verificationResult.body, {
      status: verificationResult.status,
    });
  } catch (error) {
    console.log("Error in email verification", error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: "Internal Server error",
    });
  }
}
