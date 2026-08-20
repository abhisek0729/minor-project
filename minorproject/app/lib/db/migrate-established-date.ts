import { db } from "./index";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Adding established_date column to restaurants table if not exists...");
  await db.execute(sql`
    ALTER TABLE restaurants 
    ADD COLUMN IF NOT EXISTS established_date VARCHAR(50);
  `);
  console.log("✅ Column added successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
