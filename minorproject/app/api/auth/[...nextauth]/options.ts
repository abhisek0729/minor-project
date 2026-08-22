import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import {
  usersTable,
  rolesTable,
  userRolesTable,
} from "@/app/lib/db/schema";
import bcrypt from "bcryptjs";
import { db } from "@/app/lib/db";
import { eq } from "drizzle-orm";
import { LoginCredentials, UserRole } from "@/app/features/auth/types/register";
import { User } from "next-auth";
import { cookies } from "next/headers";
import {
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
          console.log("[AUTH] Attempting login for:", credentials.identifier);

          // Query user first (without requiring roles to exist)
          const users = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, credentials.identifier.toLowerCase()));

          const user = users[0];

          if (!user) {
            console.log("[AUTH] No user found for:", credentials.identifier);
            throw new Error("Invalid email or password");
          }

          console.log("[AUTH] User found:", { id: user.id, email: user.email, isVerified: user.isVerified, provider: user.provider, hasPassword: !!user.passwordHash });

          if (!user.passwordHash && user.provider === "google") {
            throw new Error("This account was created with Google. Please add GOOGLE_CLIENT_ID to .env or sign in with password.");
          }

          if (!user.isVerified) {
            console.log("[AUTH] User NOT verified:", user.email);
            throw new Error("Please verify your email first");
          }

          if (!user.passwordHash) {
            console.log("[AUTH] No password hash for:", user.email);
            throw new Error("Password not set for this account.");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash,
          );

          if (!isPasswordValid) {
            console.log("[AUTH] Invalid password for:", user.email);
            throw new Error("Invalid email or password");
          }

          console.log("[AUTH] Password valid for:", user.email);

          // Query roles separately (user may not have roles yet)
          const userWithRoles = await db
            .select()
            .from(usersTable)
            .leftJoin(userRolesTable, eq(usersTable.id, userRolesTable.userId))
            .leftJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
            .where(eq(usersTable.id, user.id));

          const roles = userWithRoles
            .filter((row) => row.roles !== null)
            .map((row) => ({
              name: row.roles!.name,
              approvalStatus: row.user_roles!.approvalStatus,
            }));

          console.log("[AUTH] Login success for:", user.email, "roles:", roles);

          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            is_verified: user.isVerified,
            roles,
          };
        } catch (error: any) {
          console.error("[AUTH] Login error:", error.message);
          throw new Error(error.message);
        }
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
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
    async jwt({ token, user, account, trigger, session: updateData }) {
      // HANDLE SESSION UPDATE TRIGGER
      if (trigger === "update") {
        if (updateData?.roles) token.roles = updateData.roles;
        if (updateData?.name) token.name = updateData.name;
        if (token.id) {
          try {
            const freshRoles = await getUserRoles(Number(token.id));
            token.roles = freshRoles;
          } catch {
            // Keep existing roles if fetch fails
          }
        }
        return token;
      }

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
              isVerified: true,
              provider: "google",
            })
            .returning();
        }

        const userRoles = await assignRoleIfMissing(dbUser.id, role);

        token.id = dbUser.id.toString();
        token.name = dbUser.name;
        token.email = dbUser.email;
        token.is_verified = dbUser.isVerified!;
        token.roles = userRoles;
      }

      // CREDENTIALS LOGIN
      if (account?.provider === "credentials") {
        token.id = user.id?.toString();
        token.name = user.name;
        token.email = user.email;
        token.is_verified = user.is_verified || false;
        token.roles = user.roles || [];
      }

      // Always ensure token has latest live roles from database
      if (token.id) {
        try {
          const freshRoles = await getUserRoles(Number(token.id));
          if (freshRoles && freshRoles.length > 0) {
            token.roles = freshRoles;
          }
        } catch {
          // Keep existing roles if query fails
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.is_verified = token.is_verified;
        session.user.roles = token.roles || [];
      }

      return session;
    },
  },
};
