import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

let db: any = null;

try {
  if (process.env.DATABASE_URL) {
    db = drizzle(process.env.DATABASE_URL);
  } else {
    console.warn(
      "DATABASE_URL not set. Database operations will fail at runtime.",
    );
    db = null;
  }
} catch (error) {
  console.warn(
    "Failed to initialize database connection:",
    error instanceof Error ? error.message : String(error),
  );
  db = null;
}

export { db };
