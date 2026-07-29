import {
  integer,
  pgTable,
  varchar,
  pgEnum,
  timestamp,
  boolean,
  primaryKey
} from "drizzle-orm/pg-core";

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

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  password_hash: varchar({ length: 255 }),
  email: varchar({ length: 255 }).notNull().unique(),
  is_verified: boolean().default(false),
  verify_code: varchar({ length: 10 }),
  verify_code_expiry: timestamp(),
  provider: providerEnum().default("google"),
  created_at: timestamp("created_at").defaultNow().notNull(),
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

    approvalStatus: approvalStatusEnum()
      .default("pending")
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.userId, table.roleId],
    }),
  })
);


export const hotelsTable = pgTable("hotels", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer().references(() => usersTable.id, { onDelete: "cascade" }),
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
  user_id: integer().references(() => usersTable.id, { onDelete: "cascade" }),
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
  user_id: integer().references(() => usersTable.id, { onDelete: "cascade" }),
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
  user_id: integer().references(() => usersTable.id, { onDelete: "cascade" }),
  name: varchar({ length: 255 }).notNull(),
  amount: integer().notNull(),
  location: varchar({ length: 255 }).notNull(),
  type: varchar({ length: 255 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});
