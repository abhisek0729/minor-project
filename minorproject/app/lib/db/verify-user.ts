import { db } from "./index";
import { usersTable } from "./schema";
import { eq } from "drizzle-orm";

async function main() {
  await db
    .update(usersTable)
    .set({ isVerified: true })
    .where(eq(usersTable.email, "manojbaniya8@gmail.com"));

  console.log("✅ Verified manojbaniya8@gmail.com in database!");
}

main().then(() => process.exit(0)).catch(console.error);
