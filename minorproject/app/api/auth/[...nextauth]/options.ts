import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import {
  usersTable,
  rolesTable,
  userRolesTable,
  approvalStatusEnum,
} from "@/app/lib/db/schema";
import bcrypt from "bcryptjs";
import { db } from "@/app/lib/db";
import { eq } from "drizzle-orm";
import { LoginCredentials } from "@/app/features/auth/types/register";
import { User } from "next-auth";
import { cookies } from "next/headers";
import { UserRole } from "@/app/features/auth/types/register";
import { ApprovalStatus } from "@/app/types/next-auth";
import {
  getRoleByName,
  getUserRoles,
  assignRoleIfMissing,
} from "@/app/features/auth/services/roles.service";

const allowedRoles = ["tourist", "hotelOwner", "restaurantOwner", "guide"];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: {
          label: "Email",
          type: "text",
          placeholder: "jsmith",
        },
        password: { label: "Password", type: "password" },
      },

      async authorize(
        credentials: LoginCredentials | undefined,
      ): Promise<User | null> {
        if (!credentials) {
          throw new Error("Missing credentials");
        }

        try {
          const userWithRoles = await db
            .select()
            .from(usersTable)
            .innerJoin(userRolesTable, eq(usersTable.id, userRolesTable.userId))
            .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
            .where(eq(usersTable.email, credentials.identifier.toLowerCase()));

          const user = userWithRoles[0]?.users;

          const roles = userWithRoles.map((row: any) => ({
            name: row.roles.name,
            approvalStatus: row.user_roles.approvalStatus,
          }));

          if (!user) {
            throw new Error("Invalid email or password");
          }

          if (user.provider === "google") {
            throw new Error("Please sign in with Google");
          }

          if (!user.is_verified) {
            throw new Error("Please verify your email first");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password_hash!,
          );

          if (!isPasswordValid) {
            throw new Error("Invalid email or password");
          } else {
            return {
              id: user.id.toString(),
              name: user.name,
              email: user.email,
              is_verified: user.is_verified,
              roles,
            };
          }
        } catch (error: any) {
          throw new Error(error.message);
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // refresh every day if active
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account }) {
      // GOOGLE LOGIN
      if (account?.provider === "google") {
        let [dbUser] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, token.email!));

        const role =
          ((await cookies()).get("partner_role")?.value as
            | UserRole
            | undefined) ?? "tourist";

        if (!allowedRoles.includes(role)) {
          throw new Error("Invalid role");
        }

        if (!dbUser) {
          [dbUser] = await db
            .insert(usersTable)
            .values({
              email: token.email!,
              name: user.name ?? token.email!.split("@")[0],
              is_verified: true,
              provider: "google",
            })
            .returning();
        }

        const userRoles = await assignRoleIfMissing(dbUser.id, role);

        token.id = dbUser.id.toString();
        token.name = dbUser.name;
        token.email = dbUser.email;
        token.is_verified = dbUser.is_verified!;
        token.roles = userRoles;
      }

      // CREDENTIALS LOGIN
      if (account?.provider === "credentials") {
        token.id = user.id?.toString();
        token.name = user.name;
        token.email = user.email;
        token.is_verified = user.is_verified;
        token.roles = user.roles;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.is_verified = token.is_verified;
        session.user.roles = token.roles;
      }

      return session;
    },
  },
};
