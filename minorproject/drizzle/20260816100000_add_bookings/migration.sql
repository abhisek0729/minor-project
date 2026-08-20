CREATE TYPE "booking_entity_type" AS ENUM('hotel', 'room', 'restaurant', 'guide', 'place', 'travel');--> statement-breakpoint
CREATE TYPE "booking_status" AS ENUM('pending', 'confirmed', 'cancelled', 'completed');--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "bookings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"entity_type" "booking_entity_type" NOT NULL,
	"entity_id" integer NOT NULL,
	"entity_name" varchar(255) NOT NULL,
	"location" varchar(255) NOT NULL,
	"check_in_date" timestamp,
	"check_out_date" timestamp,
	"booking_status" "booking_status" DEFAULT 'pending'::"booking_status" NOT NULL,
	"total_cost" numeric(12,2) DEFAULT '0.00' NOT NULL,
	"booking_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "bookings_user_id_idx" ON "bookings" ("user_id");--> statement-breakpoint
CREATE INDEX "bookings_entity_id_idx" ON "bookings" ("entity_id");--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
