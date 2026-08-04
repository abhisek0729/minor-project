"use server";

import { cookies } from "next/headers";
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

export async function getPartnerRole(){
  
}


export async function clearPartnerRole() {
  (await cookies()).delete("partner_role");
}