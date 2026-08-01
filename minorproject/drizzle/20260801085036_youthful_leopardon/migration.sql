CREATE TABLE "facilities" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "facilities_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL UNIQUE,
	"icon" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hotel_facilities" (
	"hotelId" integer NOT NULL,
	"facilityId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hotel_images" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "hotel_images_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"hotelId" integer NOT NULL,
	"imageUrl" text NOT NULL,
	"publicId" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hotels" ADD COLUMN "establishedYear" integer;--> statement-breakpoint
ALTER TABLE "hotels" ADD COLUMN "website" varchar(255);--> statement-breakpoint
ALTER TABLE "hotels" ADD COLUMN "province" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "hotels" ADD COLUMN "district" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "hotels" ADD COLUMN "municipality" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "hotels" ADD COLUMN "ward" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "hotels" ADD COLUMN "street" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "hotels" ADD COLUMN "latitude" double precision;--> statement-breakpoint
ALTER TABLE "hotels" ADD COLUMN "longitude" double precision;--> statement-breakpoint
ALTER TABLE "hotels" ADD COLUMN "coverImageUrl" text;--> statement-breakpoint
ALTER TABLE "hotels" ADD COLUMN "coverImagePublicId" text;--> statement-breakpoint
ALTER TABLE "hotels" ADD COLUMN "updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "hotels" DROP COLUMN "hotel_image_url";--> statement-breakpoint
ALTER TABLE "hotels" DROP COLUMN "location";--> statement-breakpoint
ALTER TABLE "hotels" ALTER COLUMN "description" SET DATA TYPE text USING "description"::text;--> statement-breakpoint
ALTER TABLE "hotel_facilities" ADD CONSTRAINT "hotel_facilities_hotelId_hotels_id_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotels"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "hotel_facilities" ADD CONSTRAINT "hotel_facilities_facilityId_facilities_id_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "hotel_images" ADD CONSTRAINT "hotel_images_hotelId_hotels_id_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotels"("id") ON DELETE CASCADE;