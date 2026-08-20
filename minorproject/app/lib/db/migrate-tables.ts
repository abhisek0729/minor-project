import "dotenv/config";
import { db } from "./index";
import { sql } from "drizzle-orm";

async function main() {
  console.log("🚀 Running database table initialization...");

  if (!db) {
    console.error("❌ Database connection is not available.");
    process.exit(1);
  }

  // 1. Create Enums if not exist
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "booking_type" AS ENUM ('hotel', 'restaurant', 'guide', 'package');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "booking_status" AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "payment_method" AS ENUM ('esewa', 'khalti', 'stripe', 'cash');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "payment_status" AS ENUM ('pending', 'completed', 'failed', 'refunded');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "review_target" AS ENUM ('hotel', 'restaurant', 'guide', 'package');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "order_status" AS ENUM ('pending', 'preparing', 'served', 'completed', 'cancelled');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // 2. Create guides table columns (if not existing)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "guides" (
      "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      "user_id" integer REFERENCES "users"("id") ON DELETE CASCADE,
      "name" varchar(255) NOT NULL,
      "description" text NOT NULL,
      "location" varchar(255) NOT NULL,
      "phone_number" varchar(255) NOT NULL,
      "guide_image_url" varchar(255) NOT NULL,
      "experience_years" integer DEFAULT 1,
      "languages" varchar(255) DEFAULT 'Nepali, English',
      "daily_rate" integer DEFAULT 2000,
      "is_available" boolean DEFAULT true,
      "license_number" varchar(100),
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  // Alter guides table if columns missing
  await db.execute(sql`
    ALTER TABLE "guides" ADD COLUMN IF NOT EXISTS "experience_years" integer DEFAULT 1;
    ALTER TABLE "guides" ADD COLUMN IF NOT EXISTS "languages" varchar(255) DEFAULT 'Nepali, English';
    ALTER TABLE "guides" ADD COLUMN IF NOT EXISTS "daily_rate" integer DEFAULT 2000;
    ALTER TABLE "guides" ADD COLUMN IF NOT EXISTS "is_available" boolean DEFAULT true;
    ALTER TABLE "guides" ADD COLUMN IF NOT EXISTS "license_number" varchar(100);
  `);

  // 3. Create packages table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "packages" (
      "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      "guide_id" integer REFERENCES "guides"("id") ON DELETE CASCADE,
      "title" varchar(255) NOT NULL,
      "description" text NOT NULL,
      "destination" varchar(255) NOT NULL,
      "duration_days" integer DEFAULT 1 NOT NULL,
      "price" integer NOT NULL,
      "max_group_size" integer DEFAULT 10 NOT NULL,
      "itinerary" text,
      "included" text,
      "excluded" text,
      "package_image_url" varchar(500),
      "is_published" boolean DEFAULT true,
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  // 4. Create guide_availability table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "guide_availability" (
      "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      "guide_id" integer REFERENCES "guides"("id") ON DELETE CASCADE NOT NULL,
      "date" varchar(50) NOT NULL,
      "is_available" boolean DEFAULT true NOT NULL,
      "note" varchar(255),
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  // 5. Create bookings table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "bookings" (
      "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      "user_id" integer REFERENCES "users"("id") ON DELETE CASCADE NOT NULL,
      "booking_type" "booking_type" NOT NULL,
      "item_id" integer NOT NULL,
      "item_name" varchar(255),
      "check_in_date" varchar(50),
      "check_out_date" varchar(50),
      "guests" integer DEFAULT 1 NOT NULL,
      "total_amount" integer NOT NULL,
      "status" "booking_status" DEFAULT 'pending' NOT NULL,
      "payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
      "special_requests" text,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now()
    );
  `);

  // 6. Create payments table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "payments" (
      "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      "booking_id" integer REFERENCES "bookings"("id") ON DELETE SET NULL,
      "user_id" integer REFERENCES "users"("id") ON DELETE CASCADE NOT NULL,
      "amount" integer NOT NULL,
      "payment_method" "payment_method" NOT NULL,
      "transaction_id" varchar(255),
      "status" "payment_status" DEFAULT 'pending' NOT NULL,
      "payment_data" text,
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  // 7. Create restaurant_orders table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "restaurant_orders" (
      "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      "restaurant_id" integer REFERENCES "restaurants"("id") ON DELETE CASCADE NOT NULL,
      "user_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
      "customer_name" varchar(255) NOT NULL,
      "customer_phone" varchar(50) NOT NULL,
      "table_number" varchar(20),
      "items_json" text NOT NULL,
      "total_amount" integer NOT NULL,
      "order_type" varchar(50) DEFAULT 'dine-in',
      "status" "order_status" DEFAULT 'pending' NOT NULL,
      "payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
      "reservation_date" varchar(50),
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  // 8. Create reviews table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "reviews" (
      "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      "user_id" integer REFERENCES "users"("id") ON DELETE CASCADE NOT NULL,
      "user_name" varchar(255),
      "user_image" varchar(500),
      "target_type" "review_target" NOT NULL,
      "target_id" integer NOT NULL,
      "rating" integer NOT NULL,
      "comment" text NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  // 9. Create travel_providers table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "travel_providers" (
      "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      "user_id" integer REFERENCES "users"("id") ON DELETE CASCADE,
      "company_name" varchar(255) NOT NULL,
      "business_type" varchar(100) NOT NULL,
      "license_number" varchar(100),
      "contact_email" varchar(255) NOT NULL,
      "contact_phone" varchar(50) NOT NULL,
      "address" varchar(255) NOT NULL,
      "description" text NOT NULL,
      "logo_url" varchar(500),
      "approval_status" "approval_status" DEFAULT 'pending' NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  console.log("✅ All tables and enums initialized successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
