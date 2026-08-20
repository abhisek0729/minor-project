import { db } from "./index";
import { usersTable } from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function main() {
  const newPassword = "Password123";
  const hashed = await bcrypt.hash(newPassword, 10);

  await db
    .update(usersTable)
    .set({ passwordHash: hashed })
    .where(eq(usersTable.email, "manojbaniya80@gmail.com"));

  console.log(`✅ Password reset for manojbaniya80@gmail.com → "${newPassword}"`);
}

main().then(() => process.exit(0)).catch(console.error);
