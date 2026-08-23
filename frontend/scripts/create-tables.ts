import { db } from "../app/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Creating restaurant_images and restaurant_facilities tables...");
  
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "restaurant_images" (
      "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      "restaurant_id" integer NOT NULL REFERENCES "restaurants"("id") ON DELETE CASCADE,
      "image_url" text NOT NULL,
      "public_id" text DEFAULT '',
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `);
  console.log("✓ restaurant_images created!");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "restaurant_facilities" (
      "restaurant_id" integer NOT NULL REFERENCES "restaurants"("id") ON DELETE CASCADE,
      "facility_name" varchar(100) NOT NULL,
      "icon" varchar(50) DEFAULT 'Utensils',
      PRIMARY KEY ("restaurant_id", "facility_name")
    );
  `);
  console.log("✓ restaurant_facilities created!");

  const res = await db.execute(sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('restaurant_images', 'restaurant_facilities');
  `);
  console.log("Verified database tables in PostgreSQL:", res.rows);
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
