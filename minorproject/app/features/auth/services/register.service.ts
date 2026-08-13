import { SignUpSchema } from "../schemas/register.schema";
import { db } from "@/app/lib/db";
import { usersTable, userRolesTable } from "@/app/lib/db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import { ServiceResponse } from "../types/register";
import { sendVerificationEmail } from "@/app/email/send-email";
import { getRoleByName, getUserRoles } from "./roles.service";

const SALT_ROUNDS = 10;

export async function registerUser(
  body: SignUpSchema,
): Promise<ServiceResponse> {
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

    const dbRole = await getRoleByName(role);
    let userId: number;

    if (existingUser) {
      // Email is already registered
      const userRoles = await getUserRoles(existingUser.id);
      const hasRole = userRoles.some((r) => r.name === role);

      if (existingUser.is_verified && hasRole) {
        return {
          status: 409,
          body: {
            success: false,
            message: "Email is already registered with selected role",
          },
        };
      } else if (existingUser.is_verified && !hasRole) {
        return {
          status: 200,
          body: {
            success: false,
            message:
              "Account already exists. Please login to add new workspace",
          },
        };
      } else {
        await db
          .update(usersTable)
          .set({
            name: normalizedName,
            password_hash: hashedPassword,
            verify_code: verifyCode,
            verify_code_expiry: verifyCodeExpiry,
            provider: "credentials",
          })
          .where(eq(usersTable.id, existingUser.id));

        userId = existingUser.id;
      }
    } else {
      const [newUser] = await db
        .insert(usersTable)
        .values({
          name: normalizedName,
          email: normalizedEmail,
          password_hash: hashedPassword,
          verify_code: verifyCode,
          verify_code_expiry: verifyCodeExpiry,
          provider: "credentials",
        })
        .returning();

      userId = newUser.id;
    }

    // Check if user already has this role
    const [existingUserRole] = await db
      .select()
      .from(userRolesTable)
      .where(
        and(
          eq(userRolesTable.userId, userId),
          eq(userRolesTable.roleId, dbRole.id),
        ),
      );

    if (existingUserRole) {
      await db
        .update(userRolesTable)
        .set({
          approvalStatus,
        })
        .where(
          and(
            eq(userRolesTable.userId, userId),
            eq(userRolesTable.roleId, dbRole.id),
          ),
        );
    } else {
      await db.insert(userRolesTable).values({
        userId,
        roleId: dbRole.id,
        approvalStatus,
      });
    }

    const emailResult = await sendVerificationEmail(
      normalizedEmail,
      normalizedName,
      verifyCode,
    );

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
