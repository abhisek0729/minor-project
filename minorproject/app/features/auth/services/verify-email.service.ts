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

    const isCodeValid = code === user.verify_code;
    const isCodNotExpired = user.verify_code_expiry! > new Date();

    if (isCodeValid && isCodNotExpired) {
      await db
        .update(usersTable)
        .set({
          is_verified: true,
        })
        .where(eq(usersTable.id, user.id));

      return {
        status: 200,
        body: {
          success: true,
          message: "Your account verified successfully",
        },
      };
    } else if (!isCodNotExpired) {
      return {
        status: 400,
        body: {
          success: false,
          message:
            "Verificaition code is expired. Please sign-up again to get new verification code.",
        },
      };
    } else {
      return {
        status: 400,
        body: {
          success: false,
          message: "Invalid Verification Code",
        },
      };
    }
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
