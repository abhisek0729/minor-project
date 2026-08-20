import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __globalPgPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __globalDrizzleDb: any | undefined;
}

let db: any = null;

try {
  if (process.env.DATABASE_URL) {
    if (!globalThis.__globalPgPool) {
      globalThis.__globalPgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        ssl: {
          rejectUnauthorized: false,
        },
      });
    }

    if (!globalThis.__globalDrizzleDb) {
      globalThis.__globalDrizzleDb = drizzle(globalThis.__globalPgPool, {
        schema,
      });
    }

    db = globalThis.__globalDrizzleDb;
  } else {
    console.warn(
      "DATABASE_URL not set. Database operations will fail at runtime."
    );
    db = null;
  }
} catch (error) {
  console.warn(
    "Failed to initialize database connection:",
    error instanceof Error ? error.message : String(error)
  );
  db = null;
}

export { db };
