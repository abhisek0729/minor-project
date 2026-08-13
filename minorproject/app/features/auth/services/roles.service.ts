import { db } from "@/app/lib/db";
import { eq } from "drizzle-orm";
import {
  rolesTable,
  userRolesTable,
} from "@/app/lib/db/schema";
import { UserRole } from "@/app/features/auth/types/register";
import { ApprovalStatus } from "@/app/types/next-auth";

export type UserRoleWithStatus = {
  name: UserRole | "admin";
  approvalStatus: ApprovalStatus;
};

export async function getRoleByName(role: UserRole) {
  const [dbRole] = await db
    .select()
    .from(rolesTable)
    .where(eq(rolesTable.name, role));

  if (!dbRole) {
    throw new Error("Role not found");
  }

  return dbRole;
}

export async function getUserRoles(
  userId: number,
): Promise<UserRoleWithStatus[]> {
  return db
    .select({
      name: rolesTable.name,
      approvalStatus: userRolesTable.approvalStatus,
    })
    .from(userRolesTable)
    .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
    .where(eq(userRolesTable.userId, userId));
}

export async function assignRoleIfMissing(
  userId: number,
  role: UserRole,
): Promise<UserRoleWithStatus[]> {
  const dbRole = await getRoleByName(role);

  const roles = await getUserRoles(userId);

  const hasRole = roles.some((r) => r.name === role);

  if (!hasRole) {
    await db.insert(userRolesTable).values({
      userId,
      roleId: dbRole.id,
      approvalStatus: role === "tourist" ? "approved" : "pending",
    });

    return getUserRoles(userId);
  }

  return roles;
}