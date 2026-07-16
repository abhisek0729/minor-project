import { UserRole } from "../features/auth/types/register";

type ApprovalStatus = "pending" | "approved" | "rejected" | "suspended";

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    name?: string;
    email?: string;
    is_verified?: boolean;
    role?: UserRole | "admin";
    approval_status?: ApprovalStatus;
  }

  interface Session {
    user: {
      id?: string;
      is_verified?: boolean;
      role : UserRole | 'admin';
      approval_status?: ApprovalStatus;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt"{
    interface JWT {
      id?: string;
      name?: string;
      email?: string;
      is_verified?: boolean;
      role?:UserRole | 'admin';
      approval_status?: ApprovalStatus;
    }
    
}