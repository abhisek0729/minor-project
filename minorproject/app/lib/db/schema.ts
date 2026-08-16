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
  cuisine: varchar({ length: 255 }).notNull(),
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

// ================= GUIDES & PLACES =================
export const guidesTable = pgTable("guides", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  name: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  location: varchar({ length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 255 }).notNull(),
  guideImageUrl: varchar("guide_image_url", { length: 255 }).notNull(),
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
}));

export const restaurantsRelations = relations(restaurantsTable, ({ one, many }) => ({
  owner: one(usersTable, {
    fields: [restaurantsTable.userId],
    references: [usersTable.id],
  }),
  menus: many(menusTable),
}));

export const menusRelations = relations(menusTable, ({ one }) => ({
  restaurant: one(restaurantsTable, {
    fields: [menusTable.restaurantId],
    references: [restaurantsTable.id],
  }),
}));