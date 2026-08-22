import {
  integer,
  pgTable,
  varchar,
  pgEnum,
  timestamp,
  boolean,
  primaryKey,
  text,
  doublePrecision,
  unique,
  numeric,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ================= ENUMS =================
export const roleEnum = pgEnum("role", [
  "tourist",
  "hotelOwner",
  "restaurantOwner",
  "guide",
  "admin",
]);

export const providerEnum = pgEnum("provider", ["credentials", "google"]);

export const approvalStatusEnum = pgEnum("approval_status", [
  "pending",
  "approved",
  "rejected",
  "suspended",
]);

export const roomTypeEnum = pgEnum("room_type", [
  "single",
  "double",
  "twin",
  "family",
  "suite",
]);

export const roomStatusEnum = pgEnum("room_status", [
  "available",
  "maintenance",
  "inactive",
]);

export const bookingTypeEnum = pgEnum("booking_type", [
  "hotel",
  "restaurant",
  "guide",
  "package",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "esewa",
  "khalti",
  "stripe",
  "cash",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "completed",
  "failed",
  "refunded",
]);

export const reviewTargetEnum = pgEnum("review_target", [
  "hotel",
  "restaurant",
  "guide",
  "package",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "preparing",
  "served",
  "completed",
  "cancelled",
]);

// ================= USERS & ROLES =================
export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }),
  email: varchar({ length: 255 }).notNull().unique(),
  isVerified: boolean("is_verified").default(false),
  verifyCode: varchar("verify_code", { length: 10 }),
  verifyCodeExpiry: timestamp("verify_code_expiry"),
  provider: providerEnum().default("google"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rolesTable = pgTable("roles", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: roleEnum().notNull().unique(),
});

export const userRolesTable = pgTable(
  "user_roles",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    roleId: integer("role_id")
      .notNull()
      .references(() => rolesTable.id, { onDelete: "cascade" }),
    approvalStatus: approvalStatusEnum("approvalStatus")
      .default("pending")
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.roleId] }),
  })
);

// ================= HOTELS & ROOMS =================
export const hotelsTable = pgTable("hotels", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  name: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  establishedYear: integer("establishedYear"),
  phoneNumber: varchar("phone_number", { length: 255 }).notNull(),
  website: varchar({ length: 255 }),
  province: varchar({ length: 100 }).notNull(),
  district: varchar({ length: 100 }).notNull(),
  municipality: varchar({ length: 100 }).notNull(),
  ward: varchar({ length: 20 }).notNull(),
  street: varchar({ length: 255 }).notNull(),
  latitude: doublePrecision(),
  longitude: doublePrecision(),
  coverImageUrl: text("coverImageUrl"),
  coverImagePublicId: text("coverImagePublicId"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const hotelImagesTable = pgTable("hotel_images", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  hotelId: integer("hotelId")
    .references(() => hotelsTable.id, { onDelete: "cascade" })
    .notNull(),
  imageUrl: text("imageUrl").notNull(),
  publicId: text("publicId").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const facilitiesTable = pgTable("facilities", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 100 }).notNull().unique(),
  icon: varchar({ length: 50 }).notNull(),
});

export const hotelFacilitiesTable = pgTable("hotel_facilities", {
  hotelId: integer("hotelId")
    .references(() => hotelsTable.id, { onDelete: "cascade" })
    .notNull(),
  facilityId: integer("facilityId")
    .references(() => facilitiesTable.id, { onDelete: "cascade" })
    .notNull(),
});

export const roomsTable = pgTable(
  "rooms",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    hotelId: integer("hotel_id")
      .references(() => hotelsTable.id, { onDelete: "cascade" })
      .notNull(),
    roomNumber: varchar("room_number", { length: 20 }).notNull(),
    roomType: roomTypeEnum("room_type").notNull(),
    description: text().notNull(),
    pricePerNight: numeric("price_per_night", { precision: 10, scale: 2 }).notNull(),
    capacity: integer().notNull(),
    status: roomStatusEnum("status").default("available").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    unique("rooms_hotel_room_number_unique").on(table.hotelId, table.roomNumber),
  ]
);

export const roomImagesTable = pgTable("room_images", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  roomId: integer("room_id")
    .references(() => roomsTable.id, { onDelete: "cascade" })
    .notNull(),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  publicId: varchar("public_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const roomFacilitiesTable = pgTable(
  "room_facilities",
  {
    roomId: integer("room_id")
      .references(() => roomsTable.id, { onDelete: "cascade" })
      .notNull(),
    facilityId: integer("facility_id")
      .references(() => facilitiesTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.roomId, table.facilityId] }),
  ]
);

// ================= RESTAURANTS & MENUS =================
export const restaurantsTable = pgTable("restaurants", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  restaurantImageUrl: varchar("restaurant_image_url", { length: 255 }).notNull(),
  location: varchar({ length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 255 }).notNull(),
  cuisine: varchar({ length: 255 }).default("Multi-Cuisine"),
  establishedDate: varchar("established_date", { length: 50 }),
  isOpen: boolean("is_open").default(true),
  openingTime: varchar("opening_time", { length: 50 }).default("09:00 AM"),
  closingTime: varchar("closing_time", { length: 50 }).default("10:00 PM"),
});

export const menusTable = pgTable("menus", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  restaurantId: integer("restaurant_id")
    .references(() => restaurantsTable.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  menusImageUrl: varchar("menus_image_url", { length: 255 }).notNull(),
  price: integer().notNull(),
  category: varchar("category", { length: 100 }).default("Main Course"),
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const guidesTable = pgTable("guides", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  name: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  location: varchar({ length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 255 }).notNull(),
  guideImageUrl: varchar("guide_image_url", { length: 255 }).notNull(),
  experienceYears: integer("experience_years").default(1),
  languages: varchar("languages", { length: 255 }).default("Nepali, English"),
  dailyRate: integer("daily_rate").default(2000),
  isAvailable: boolean("is_available").default(true),
  licenseNumber: varchar("license_number", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const packagesTable = pgTable("packages", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  guideId: integer("guide_id").references(() => guidesTable.id, { onDelete: "cascade" }),
  title: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  destination: varchar({ length: 255 }).notNull(),
  durationDays: integer("duration_days").notNull().default(1),
  price: integer().notNull(),
  maxGroupSize: integer("max_group_size").notNull().default(10),
  itinerary: text(),
  included: text(),
  excluded: text(),
  packageImageUrl: varchar("package_image_url", { length: 500 }),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const guideAvailabilityTable = pgTable("guide_availability", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  guideId: integer("guide_id")
    .references(() => guidesTable.id, { onDelete: "cascade" })
    .notNull(),
  date: varchar({ length: 50 }).notNull(), // YYYY-MM-DD
  isAvailable: boolean("is_available").default(true).notNull(),
  note: varchar({ length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ================= BOOKINGS & PAYMENTS =================
export const bookingsTable = pgTable("bookings", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  bookingType: bookingTypeEnum("booking_type").notNull(),
  itemId: integer("item_id").notNull(), // hotelId / restaurantId / guideId / packageId
  itemName: varchar("item_name", { length: 255 }),
  checkInDate: varchar("check_in_date", { length: 50 }),
  checkOutDate: varchar("check_out_date", { length: 50 }),
  guests: integer().default(1).notNull(),
  totalAmount: integer("total_amount").notNull(),
  status: bookingStatusEnum("status").default("pending").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").default("pending").notNull(),
  specialRequests: text("special_requests"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const paymentsTable = pgTable("payments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  bookingId: integer("booking_id").references(() => bookingsTable.id, { onDelete: "set null" }),
  userId: integer("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  amount: integer().notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  transactionId: varchar("transaction_id", { length: 255 }),
  status: paymentStatusEnum("status").default("pending").notNull(),
  paymentData: text("payment_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ================= RESTAURANT ORDERS & RESERVATIONS =================
export const restaurantOrdersTable = pgTable("restaurant_orders", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  restaurantId: integer("restaurant_id")
    .references(() => restaurantsTable.id, { onDelete: "cascade" })
    .notNull(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "set null" }),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 50 }).notNull(),
  tableNumber: varchar("table_number", { length: 20 }),
  itemsJson: text("items_json").notNull(), // JSON string of [{ name, price, qty }]
  totalAmount: integer("total_amount").notNull(),
  orderType: varchar("order_type", { length: 50 }).default("dine-in"), // dine-in, takeaway, reservation
  status: orderStatusEnum("status").default("pending").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").default("pending").notNull(),
  reservationDate: varchar("reservation_date", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ================= REVIEWS & RATINGS =================
export const reviewsTable = pgTable("reviews", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  userName: varchar("user_name", { length: 255 }),
  userImage: varchar("user_image", { length: 500 }),
  targetType: reviewTargetEnum("target_type").notNull(), // hotel / restaurant / guide / package
  targetId: integer("target_id").notNull(),
  rating: integer().notNull(), // 1 to 5
  comment: text().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ================= TRAVEL PROVIDERS =================
export const travelProvidersTable = pgTable("travel_providers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  businessType: varchar("business_type", { length: 100 }).notNull(), // Agency, Transport, Equipment
  licenseNumber: varchar("license_number", { length: 100 }),
  contactEmail: varchar("contact_email", { length: 255 }).notNull(),
  contactPhone: varchar("contact_phone", { length: 50 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  description: text().notNull(),
  logoUrl: varchar("logo_url", { length: 500 }),
  approvalStatus: approvalStatusEnum("approval_status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const placesTable = pgTable("places", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  location: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  placeImageUrl: varchar("place_image_url", { length: 255 }).notNull(),
  mapUrl: varchar("map_url", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const expensesTable = pgTable("expenses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  name: varchar({ length: 255 }).notNull(),
  amount: integer().notNull(),
  location: varchar({ length: 255 }).notNull(),
  type: varchar({ length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ================= RELATIONS =================

export const usersRelations = relations(usersTable, ({ many }) => ({
  roles: many(userRolesTable),
  restaurants: many(restaurantsTable),
  hotels: many(hotelsTable),
  bookings: many(bookingsTable),
  reviews: many(reviewsTable),
}));

export const restaurantsRelations = relations(restaurantsTable, ({ one, many }) => ({
  owner: one(usersTable, {
    fields: [restaurantsTable.userId],
    references: [usersTable.id],
  }),
  menus: many(menusTable),
  orders: many(restaurantOrdersTable),
}));

export const menusRelations = relations(menusTable, ({ one }) => ({
  restaurant: one(restaurantsTable, {
    fields: [menusTable.restaurantId],
    references: [restaurantsTable.id],
  }),
}));

export const guidesRelations = relations(guidesTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [guidesTable.userId],
    references: [usersTable.id],
  }),
  packages: many(packagesTable),
  availability: many(guideAvailabilityTable),
}));

export const packagesRelations = relations(packagesTable, ({ one }) => ({
  guide: one(guidesTable, {
    fields: [packagesTable.guideId],
    references: [guidesTable.id],
  }),
}));

export const bookingsRelations = relations(bookingsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [bookingsTable.userId],
    references: [usersTable.id],
  }),
  payments: many(paymentsTable),
}));

export const paymentsRelations = relations(paymentsTable, ({ one }) => ({
  booking: one(bookingsTable, {
    fields: [paymentsTable.bookingId],
    references: [bookingsTable.id],
  }),
  user: one(usersTable, {
    fields: [paymentsTable.userId],
    references: [usersTable.id],
  }),
}));

export const expensesRelations = relations(expensesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [expensesTable.userId],
    references: [usersTable.id],
  }),
}));

export const aiUserMemoriesTable = pgTable("ai_user_memories", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  memoryKey: varchar("memory_key", { length: 100 }).notNull(),
  memoryValue: text("memory_value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiUserMemoriesRelations = relations(aiUserMemoriesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [aiUserMemoriesTable.userId],
    references: [usersTable.id],
  }),
}));

// ================= EMERGENCY & SOS DISPATCH =================
export const emergencyAlertsTable = pgTable("emergency_alerts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "set null" }),
  touristName: varchar("tourist_name", { length: 255 }).notNull(),
  contactNumber: varchar("contact_number", { length: 50 }).notNull(),
  emergencyType: varchar("emergency_type", { length: 100 }).notNull(), // 'police', 'flood_disaster', 'medical_ambulance', 'lost_trekking', 'altitude_sickness', 'other'
  severity: varchar("severity", { length: 50 }).default("high").notNull(),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  locationAddress: text("location_address"),
  situationDescription: text("situation_description").notNull(),
  status: varchar("status", { length: 50 }).default("dispatched").notNull(), // 'dispatched', 'in_progress', 'resolved'
  dispatchProtocol: text("dispatch_protocol"),
  isOfflineSmsSent: boolean("is_offline_sms_sent").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emergencyAlertsRelations = relations(emergencyAlertsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [emergencyAlertsTable.userId],
    references: [usersTable.id],
  }),
}));

// ================= DESTINATIONS =================
export const destinationsTable = pgTable("destinations", {
  id: integer().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  region: varchar({ length: 255 }).notNull(),
  category: varchar({ length: 100 }).notNull(),
  altitude: varchar({ length: 100 }),
  bestSeason: varchar("best_season", { length: 255 }),
  rating: doublePrecision().default(4.8),
  reviews: integer().default(100),
  startingCost: varchar("starting_cost", { length: 100 }),
  coverImage: text("cover_image").notNull(),
  shortDescription: text("short_description").notNull(),
  historyAndCulture: text("history_and_culture"),
  activities: jsonb("activities"), // string[]
  highlights: jsonb("highlights"), // string[]
  mapQuery: text("map_query"),
  nearbyAttractions: jsonb("nearby_attractions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
