"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { and, eq } from "drizzle-orm";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/app/lib/db";
import { rolesTable, userRolesTable } from "@/app/lib/db/schema";
import { ApiResponse } from "@/app/types/api";

export async function requestAdminAccess(): Promise<ApiResponse<{ status: string }>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const userId = Number(session.user.id);

    // Get admin role ID
    const [adminRole] = await db
      .select({ id: rolesTable.id })
      .from(rolesTable)
      .where(eq(rolesTable.name, "admin"));

    if (!adminRole) {
      return { success: false, message: "Admin role not found" };
    }

    // Check if user already has admin role in user_roles
    const [existing] = await db
      .select()
      .from(userRolesTable)
      .where(
        and(
          eq(userRolesTable.userId, userId),
          eq(userRolesTable.roleId, adminRole.id)
        )
      );

    if (existing) {
      return {
        success: true,
        message:
          existing.approvalStatus === "approved"
            ? "Admin role already approved."
            : "Admin role is pending approval by the website owner.",
        data: { status: existing.approvalStatus },
      };
    }

    // Insert pending admin role
    await db.insert(userRolesTable).values({
      userId,
      roleId: adminRole.id,
      approvalStatus: "pending",
    });

    revalidatePath("/workspace");
    revalidatePath("/profile");

    return {
      success: true,
      message: "Admin request submitted! The website owner can approve this in the database.",
      data: { status: "pending" },
    };
  } catch (error: any) {
    console.error("Error requesting admin access:", error);
    return {
      success: false,
      message: error?.message || "Failed to request admin access",
    };
  }
}
