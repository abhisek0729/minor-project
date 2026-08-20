import { db } from "./index";
import { usersTable, userRolesTable, rolesTable } from "./schema";
import { eq, desc } from "drizzle-orm";

async function main() {
  const users = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      isVerified: usersTable.isVerified,
      provider: usersTable.provider,
      verifyCode: usersTable.verifyCode,
      hasPassword: usersTable.passwordHash,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .orderBy(desc(usersTable.id))
    .limit(10);

  console.log("Recent registered users in DB:");
  for (const u of users) {
    console.log({
      id: u.id,
      name: u.name,
      email: u.email,
      isVerified: u.isVerified,
      provider: u.provider,
      verifyCode: u.verifyCode,
      hasPassword: !!u.hasPassword,
    });
  }
}

main().then(() => process.exit(0)).catch(console.error);
