import { db } from "./index";
import { sql, eq } from "drizzle-orm";
import {
  hotelsTable,
  roomsTable,
  restaurantsTable,
  menusTable,
  guidesTable,
  packagesTable,
  guideAvailabilityTable,
  usersTable,
} from "./schema";
import fs from "fs";
import path from "path";

async function runFastSeeder() {
  console.log("⚡ Starting High-Speed Batch Seed into PostgreSQL Database...");

  // 1. Ensure Super Admin Owner account exists
  let [systemUser] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, "manoj@gmail.com"))
    .limit(1);

  if (!systemUser) {
    const [created] = await db
      .insert(usersTable)
      .values({
        name: "Manoj (Super Admin)",
        email: "manoj@gmail.com",
        isVerified: true,
        provider: "credentials",
      })
      .returning({ id: usersTable.id });
    systemUser = created;
  }
  const defaultOwnerId = systemUser.id;

  // 2. SEED DESTINATIONS (Chunked Bulk Insert)
  const destinationsPath = path.join(process.cwd(), "destinations.json");
  if (fs.existsSync(destinationsPath)) {
    const destinations = JSON.parse(fs.readFileSync(destinationsPath, "utf-8"));
    console.log(`\n📌 Bulk Inserting ${destinations.length} Destinations...`);

    // Ensure table structure
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS destinations (
        id INTEGER PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        region VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        altitude VARCHAR(100),
        best_season VARCHAR(255),
        rating DOUBLE PRECISION DEFAULT 4.8,
        reviews INTEGER DEFAULT 100,
        starting_cost VARCHAR(100),
        cover_image TEXT NOT NULL,
        short_description TEXT NOT NULL,
        history_and_culture TEXT,
        activities JSONB,
        highlights JSONB,
        map_query TEXT,
        nearby_attractions JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // Clear old records
    await db.execute(sql`DELETE FROM destinations`);

    const chunkSize = 25;
    for (let i = 0; i < destinations.length; i += chunkSize) {
      const chunk = destinations.slice(i, i + chunkSize);
      const valuesClauses = chunk.map((item: any) => {
        return sql`(${item.id}, ${item.name}, ${item.region}, ${item.category}, ${item.altitude}, ${item.bestSeason}, ${item.rating}, ${item.reviews}, ${item.startingCost}, ${item.coverImage}, ${item.shortDescription}, ${item.historyAndCulture}, ${JSON.stringify(item.activities)}::jsonb, ${JSON.stringify(item.highlights)}::jsonb, ${item.mapQuery}, ${JSON.stringify(item.nearbyAttractions)}::jsonb, NOW())`;
      });

      await db.execute(sql`
        INSERT INTO destinations (
          id, name, region, category, altitude, best_season, rating, reviews, starting_cost,
          cover_image, short_description, history_and_culture, activities, highlights, map_query, nearby_attractions, created_at
        )
        VALUES ${sql.join(valuesClauses, sql`, `)}
      `);
      console.log(`  ✓ Destinations ${i + 1} to ${Math.min(i + chunkSize, destinations.length)} inserted`);
    }
    console.log(`✅ All ${destinations.length} Destinations Seeded!`);
  }

  // 3. SEED HOTELS & ROOMS
  const hotelsPath = path.join(process.cwd(), "hotels.json");
  if (fs.existsSync(hotelsPath)) {
    const hotels = JSON.parse(fs.readFileSync(hotelsPath, "utf-8"));
    console.log(`\n📌 Bulk Inserting ${hotels.length} Hotels & Rooms...`);

    const hotelValues = hotels.map((h: any) => ({
      userId: defaultOwnerId,
      name: h.name,
      description: h.description,
      establishedYear: h.establishedYear,
      phoneNumber: h.phoneNumber,
      website: h.website,
      province: h.province,
      district: h.district,
      municipality: h.municipality,
      ward: h.ward,
      street: h.street,
      latitude: h.latitude,
      longitude: h.longitude,
      coverImageUrl: h.coverImageUrl,
    }));

    // Insert hotels in batches of 20
    const insertedHotelIds: number[] = [];
    const hChunkSize = 20;
    for (let i = 0; i < hotelValues.length; i += hChunkSize) {
      const batch = hotelValues.slice(i, i + hChunkSize);
      const inserted = await db.insert(hotelsTable).values(batch).returning({ id: hotelsTable.id });
      insertedHotelIds.push(...inserted.map((item) => item.id));
      console.log(`  ✓ Hotels ${i + 1} to ${Math.min(i + hChunkSize, hotelValues.length)} inserted`);
    }

    // Now insert associated rooms in bulk
    const allRooms: any[] = [];
    hotels.forEach((h: any, idx: number) => {
      const hotelId = insertedHotelIds[idx];
      if (hotelId && h.rooms) {
        h.rooms.forEach((r: any) => {
          allRooms.push({
            hotelId: hotelId,
            roomNumber: r.roomNumber,
            roomType: r.roomType,
            pricePerNight: r.pricePerNight,
            capacity: r.capacity,
            description: r.description,
            status: r.status || "available",
          });
        });
      }
    });

    if (allRooms.length > 0) {
      const rChunk = 50;
      for (let i = 0; i < allRooms.length; i += rChunk) {
        await db.insert(roomsTable).values(allRooms.slice(i, i + rChunk));
      }
      console.log(`  ✓ Inserted ${allRooms.length} luxury rooms for all hotels!`);
    }
    console.log(`✅ All ${hotels.length} Hotels Seeded!`);
  }

  // 4. SEED RESTAURANTS & MENUS
  const restaurantsPath = path.join(process.cwd(), "restaurants.json");
  if (fs.existsSync(restaurantsPath)) {
    const restaurants = JSON.parse(fs.readFileSync(restaurantsPath, "utf-8"));
    console.log(`\n📌 Bulk Inserting ${restaurants.length} Restaurants & Menus...`);

    const restValues = restaurants.map((r: any) => ({
      userId: defaultOwnerId,
      name: r.name,
      description: r.description,
      phoneNumber: r.phoneNumber,
      establishedDate: r.establishedDate,
      cuisine: r.cuisine,
      location: r.location,
      isOpen: r.isOpen ?? true,
      openingTime: r.openingTime || "08:00 AM",
      closingTime: r.closingTime || "10:30 PM",
      restaurantImageUrl: r.restaurantImageUrl,
    }));

    const insertedRestIds: number[] = [];
    const restChunkSize = 20;
    for (let i = 0; i < restValues.length; i += restChunkSize) {
      const batch = restValues.slice(i, i + restChunkSize);
      const inserted = await db.insert(restaurantsTable).values(batch).returning({ id: restaurantsTable.id });
      insertedRestIds.push(...inserted.map((item) => item.id));
      console.log(`  ✓ Restaurants ${i + 1} to ${Math.min(i + restChunkSize, restValues.length)} inserted`);
    }

    // Insert menus in bulk
    const allMenus: any[] = [];
    restaurants.forEach((r: any, idx: number) => {
      const restId = insertedRestIds[idx];
      if (restId && r.menus) {
        r.menus.forEach((m: any) => {
          allMenus.push({
            restaurantId: restId,
            name: m.name,
            description: m.description,
            price: m.price,
            category: m.category,
            menusImageUrl: m.menusImageUrl,
            isAvailable: m.isAvailable ?? true,
          });
        });
      }
    });

    if (allMenus.length > 0) {
      const mChunk = 50;
      for (let i = 0; i < allMenus.length; i += mChunk) {
        await db.insert(menusTable).values(allMenus.slice(i, i + mChunk));
      }
      console.log(`  ✓ Inserted ${allMenus.length} authentic food & drink menu items!`);
    }
    console.log(`✅ All ${restaurants.length} Restaurants Seeded!`);
  }

  // 5. SEED GUIDES & PACKAGES
  const guidesPath = path.join(process.cwd(), "guides.json");
  if (fs.existsSync(guidesPath)) {
    const guides = JSON.parse(fs.readFileSync(guidesPath, "utf-8"));
    console.log(`\n📌 Bulk Inserting ${guides.length} Tour Guides & Packages...`);

    const guideValues = guides.map((g: any) => ({
      userId: defaultOwnerId,
      name: g.name,
      description: g.description,
      location: g.location,
      phoneNumber: g.phoneNumber,
      guideImageUrl: g.guideImageUrl,
      experienceYears: g.experienceYears,
      languages: g.languages,
      dailyRate: g.dailyRate,
      isAvailable: g.isAvailable ?? true,
      licenseNumber: g.licenseNumber,
    }));

    const insertedGuideIds: number[] = [];
    const gChunkSize = 20;
    for (let i = 0; i < guideValues.length; i += gChunkSize) {
      const batch = guideValues.slice(i, i + gChunkSize);
      const inserted = await db.insert(guidesTable).values(batch).returning({ id: guidesTable.id });
      insertedGuideIds.push(...inserted.map((item) => item.id));
      console.log(`  ✓ Guides ${i + 1} to ${Math.min(i + gChunkSize, guideValues.length)} inserted`);
    }

    // Insert packages & availability in bulk
    const allPackages: any[] = [];
    const allAvailabilities: any[] = [];

    guides.forEach((g: any, idx: number) => {
      const guideId = insertedGuideIds[idx];
      if (guideId) {
        if (g.packages) {
          g.packages.forEach((p: any) => {
            allPackages.push({
              guideId: guideId,
              title: p.title,
              description: p.description,
              destination: p.destination,
              durationDays: p.durationDays,
              price: p.price,
              maxGroupSize: p.maxGroupSize,
              itinerary: p.itinerary,
              included: p.included,
              excluded: p.excluded,
              packageImageUrl: p.packageImageUrl,
              isPublished: p.isPublished ?? true,
            });
          });
        }
        if (g.availability) {
          g.availability.forEach((av: any) => {
            allAvailabilities.push({
              guideId: guideId,
              date: av.date,
              isAvailable: av.isAvailable,
              note: av.note,
            });
          });
        }
      }
    });

    if (allPackages.length > 0) {
      const pChunk = 50;
      for (let i = 0; i < allPackages.length; i += pChunk) {
        await db.insert(packagesTable).values(allPackages.slice(i, i + pChunk));
      }
      console.log(`  ✓ Inserted ${allPackages.length} trekking and adventure packages!`);
    }

    if (allAvailabilities.length > 0) {
      const aChunk = 50;
      for (let i = 0; i < allAvailabilities.length; i += aChunk) {
        await db.insert(guideAvailabilityTable).values(allAvailabilities.slice(i, i + aChunk));
      }
      console.log(`  ✓ Inserted ${allAvailabilities.length} calendar availability records!`);
    }
    console.log(`✅ All ${guides.length} Tour Guides Seeded!`);
  }

  console.log("\n🎉 ALL 400 RECORDS SEEDED SUCCESSFULLY INTO POSTGRESQL IN BULK!");
  process.exit(0);
}

runFastSeeder().catch((err) => {
  console.error("❌ High-speed seeding failed:", err);
  process.exit(1);
});
