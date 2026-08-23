import { db } from "@/app/lib/db";
import { usersTable } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";
import { ServiceResponse } from "../types/register";

export async function emailVerification(body: {
  email: string;
  code: string;
}): Promise<ServiceResponse> {
  try {
    const { email, code } = body;
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (!user) {
      return {
        status: 404,
        body: {
          success: false,
          message: "User not found",
        },
      };
    }

    const isCodeValid = code === user.verifyCode;
    const isCodeNotExpired = user.verifyCodeExpiry !== null && user.verifyCodeExpiry > new Date();

    if (isCodeValid && isCodeNotExpired) {
      await db
        .update(usersTable)
        .set({
          isVerified: true,
        })
        .where(eq(usersTable.id, user.id));

      return {
        status: 200,
        body: {
          success: true,
          message: "Your account verified successfully",
        },
      };
    } else if (!isCodeValid) {
      return {
        status: 400,
        body: {
          success: false,
          message: "Invalid verification code",
        },
      };
    }

    return {
      status: 410,
      body: {
        success: false,
        message:
          "Verification code has expired. Please register again to receive a new verification code.",
      },
    };
  } catch (error) {
    console.log("Error in email verification ", error);
    return {
      status: 500,
      body: {
        success: false,
        message: "Internal Server Error",
      },
    };
  }
}
