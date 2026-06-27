import { pgTable, serial, text, varchar, integer, numeric, timestamp, pgEnum, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const listingStatusEnum = pgEnum("listing_status", ["active", "inactive", "pending"]);
export const pricingTypeEnum = pgEnum("pricing_type", ["hourly", "daily", "monthly", "all"]);

export const listingsTable = pgTable("listings", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }),
  lat: numeric("lat", { precision: 10, scale: 7 }),
  lng: numeric("lng", { precision: 10, scale: 7 }),
  hostId: integer("host_id").notNull().references(() => usersTable.id),
  hourlyRate: numeric("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  dailyRate: numeric("daily_rate", { precision: 10, scale: 2 }),
  monthlyRate: numeric("monthly_rate", { precision: 10, scale: 2 }),
  pricingType: pricingTypeEnum("pricing_type").notNull().default("hourly"),
  vehicleTypes: json("vehicle_types").$type<string[]>().notNull().default([]),
  amenities: json("amenities").$type<string[]>().notNull().default([]),
  photos: json("photos").$type<string[]>().notNull().default([]),
  dimensions: varchar("dimensions", { length: 100 }),
  totalSpots: integer("total_spots").notNull().default(1),
  availableSpots: integer("available_spots").notNull().default(1),
  rules: text("rules"),
  instructions: text("instructions"),
  rating: numeric("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").notNull().default(0),
  status: listingStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertListingSchema = createInsertSchema(listingsTable).omit({ id: true, createdAt: true });
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listingsTable.$inferSelect;
