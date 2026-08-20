"use server";

import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { assignRoleIfMissing } from "../services/roles.service";
import { UserRole } from "@/app/features/auth/types/register";

export async function setPartnerRole(role: UserRole) {
  (await cookies()).set("partner_role", role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });
}

export async function addPartnerRoleAction(role: UserRole) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  await assignRoleIfMissing(Number(session.user.id), role);
  return { success: true, message: `Added ${role} workspace` };
}

export async function clearPartnerRole() {
  (await cookies()).delete("partner_role");
}