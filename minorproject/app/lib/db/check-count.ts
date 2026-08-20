import { db } from "./index";
import { destinationsTable } from "./schema";
import { sql } from "drizzle-orm";

async function main() {
  const [res] = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(destinationsTable);
  console.log("Verified total destinations in DB:", res?.count);
}

main().then(() => process.exit(0)).catch(console.error);
