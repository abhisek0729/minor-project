import { db } from "./index";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Creating expenses table if not exists...");
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      amount INTEGER NOT NULL,
      location VARCHAR(255) NOT NULL,
      type VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);
  console.log("✅ expenses table created successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
