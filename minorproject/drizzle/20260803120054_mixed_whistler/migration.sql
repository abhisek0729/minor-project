CREATE TYPE "room_status" AS ENUM('available', 'maintenance', 'inactive');--> statement-breakpoint
CREATE TYPE "room_type" AS ENUM('single', 'double', 'twin', 'family', 'suite');--> statement-breakpoint
CREATE TABLE "room_facilities" (
	"room_id" integer,
	"facility_id" integer,
	CONSTRAINT "room_facilities_pkey" PRIMARY KEY("room_id","facility_id")
);
--> statement-breakpoint
CREATE TABLE "room_images" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "room_images_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"room_id" integer NOT NULL,
	"image_url" varchar(500) NOT NULL,
	"public_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "price_per_night" numeric(10,2) NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "capacity" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "status" "room_status" DEFAULT 'available'::"room_status" NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" DROP COLUMN "room_image_url";--> statement-breakpoint
ALTER TABLE "rooms" DROP COLUMN "price";--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "room_number" SET DATA TYPE varchar(20) USING "room_number"::varchar(20);--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "room_type" SET DATA TYPE "room_type" USING "room_type"::"room_type";--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "description" SET DATA TYPE text USING "description"::text;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_hotel_room_number_unique" UNIQUE("hotel_id","room_number");--> statement-breakpoint
ALTER TABLE "room_facilities" ADD CONSTRAINT "room_facilities_room_id_rooms_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "room_facilities" ADD CONSTRAINT "room_facilities_facility_id_facilities_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "room_images" ADD CONSTRAINT "room_images_room_id_rooms_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE;