import {
  pgTable,
  varchar,
  timestamp,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";

export const twitSnap = pgTable("twitsnaps", {
  id: uuid("id").defaultRandom().primaryKey(),
  message: varchar("content", { length: 280 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isPrivate: boolean("is_private").default(false).notNull(),
  createdBy: uuid("created_by").notNull(),
});

export type SelectTwitsnap = typeof twitSnap.$inferSelect;
export type InsertTwitsnap = typeof twitSnap.$inferInsert;
