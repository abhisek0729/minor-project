import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { usersTable } from "@/app/lib/db/schema";
import bcrypt from "bcryptjs";
import { db } from "@/app/lib/db";
import { eq } from "drizzle-orm";
import { LoginCredentials } from "@/app/features/auth/types/register";
import { User } from "next-auth";

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
          const [user] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, credentials.identifier.toLowerCase()));

          if (!user) {
            throw new Error("Invalid email or password");
          }

          if (user.provider === "google") {
            throw new Error("Please sign in with Google");
          }

          if (!user.is_verified) {
            throw new Error("Please verify your email first");
          }

          if (user.approval_status !== "approved") {
            throw new Error("Your account is awaiting approval");
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
              role: user.role!,
              approval_status: user.approval_status,
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

        if (!dbUser) {
          let [newUser] = await db
            .insert(usersTable)
            .values({
              email: token.email!,
              name: user.name ?? token.email!.split("@")[0],
              is_verified: true,
              provider: "google",
              approval_status: "approved",
            })
            .returning();

          dbUser = newUser;
        }
        token.id = dbUser.id.toString();
        token.name = dbUser.name;
        token.email = dbUser.email;
        token.is_verified = dbUser.is_verified!;
        token.role = dbUser.role!;
        token.approval_status = dbUser.approval_status!;
      }

      // CREDENTIALS LOGIN
      if (account?.provider === "credentials") {
        token.id = user.id?.toString();
        token.name = user.name;
        token.email = user.email;
        token.is_verified = user.is_verified;
        token.role = user.role;
        token.approval_status = user.approval_status;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.is_verified = token.is_verified;
        session.user.role = token.role!;
        session.user.approval_status = token.approval_status;
      }

      return session;
    },
  },
};
