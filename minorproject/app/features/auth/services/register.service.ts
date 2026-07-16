import { SignUpSchema } from "../schemas/register.schema";
import { db } from "@/app/lib/db";
import { usersTable } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

import { ServiceResponse } from "../types/register";
import { sendVerificationEmail } from "@/app/email/send-email";

const SALT_ROUNDS = 10

export async function registerUser(body: SignUpSchema): Promise<ServiceResponse> {


  try {
    const { name, email, password, role } = body;

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();


    const [existingUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, normalizedEmail));

    if (existingUser?.provider === "google") {
      return {
        status: 409,
        body: {
          success: false,
          message:
            "Email is already registered with Google. Continue with google to login",
        },
      };
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const approvalStatus = role === "tourist" ? "approved" : "pending";
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const verifyCodeExpiry = new Date();
    verifyCodeExpiry.setHours(verifyCodeExpiry.getHours() + 1);

    if (existingUser) {
      // Email is already registered
      if (existingUser.is_verified) {
        return {
          status: 409,
          body: {
            success: false,
            message: "Email is already registered",
          },
        };
      } else {
        await db
          .update(usersTable)
          .set({
            name : normalizedName,
            password_hash: hashedPassword,
            verify_code: verifyCode,
            verify_code_expiry: verifyCodeExpiry,
            provider: "credentials",
            approval_status: approvalStatus,
            role,
          })
          .where(eq(usersTable.id, existingUser.id));
      }
    } else {
      await db.insert(usersTable).values({
        name,
        email : normalizedEmail,
        password_hash: hashedPassword,
        verify_code: verifyCode,
        verify_code_expiry: verifyCodeExpiry,
        provider: "credentials",
        approval_status: approvalStatus,
        role,
      });
    }

    const emailResult = await sendVerificationEmail(email, normalizedName, verifyCode);

    if (!emailResult.success) {
      return {
        status: 500,
        body: {
          success: false,
          message: "Unable to send verification email.",
        },
      };
    }
    return {
      status: 201,
      body: {
        success: true,
        message: "Registration successful. Please verify your email.",
      },
    };
  } catch (error) {
        console.error("Registration Error:", error);
    return {
      status: 500,
      body: {
        success: false,
        message: "Error in registration",
      },
    };
  }
}
