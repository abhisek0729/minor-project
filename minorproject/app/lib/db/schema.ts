import { integer, pgTable, varchar, pgEnum,timestamp } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin", "owner"]);

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  password_hash:varchar({length:255}),
  email: varchar({ length: 255 }).notNull().unique(),
  role: roleEnum().default("user"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const hotelsTable = pgTable("hotels", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  hotel_image_url: varchar({ length: 255 }).notNull(),
  location: varchar({ length: 255 }).notNull(),
  phone_number: varchar({ length: 255 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});
export const roomsTable = pgTable("rooms", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  hotel_id: integer()
    .references(() => hotelsTable.id, { onDelete: "cascade" })
    .notNull(),
  room_number: varchar({ length: 255 }).notNull(),
  room_type: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  room_image_url: varchar({ length: 255 }).notNull(),
  price: integer().notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const restaurantsTable = pgTable("restaurants", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
    user_id: integer()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  description: varchar({ length: 255 }).notNull(),
  restaurant_image_url: varchar({ length: 255 }).notNull(),
  location: varchar({ length: 255 }).notNull(),
  phone_number: varchar({ length: 255 }).notNull(),
  cuisine: varchar({ length: 255 }).notNull(),
});

export const menusTable = pgTable("menus", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  restaurant_id: integer()
    .references(() => restaurantsTable.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  menus_image_url: varchar({ length: 255 }).notNull(),
  price: integer().notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const guidesTable = pgTable("guides", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
    user_id: integer()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  description: varchar({ length: 255 }).notNull(),
  location: varchar({ length: 255 }).notNull(),
  phone_number: varchar({ length: 255 }).notNull(),
  guide_image_url: varchar({ length: 255 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const placesTable = pgTable("places", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  location: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  place_image_url: varchar({ length: 255 }).notNull(),
  map_url: varchar({ length: 255 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const expensesTable = pgTable("expenses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
    user_id: integer()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  name: varchar({ length: 255 }).notNull(),
  amount: integer().notNull(),
  location: varchar({ length: 255 }).notNull(),
  type: varchar({ length: 255 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});
