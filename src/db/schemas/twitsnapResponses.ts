// import {
//     pgTable,
//     varchar,
//     timestamp,
//     uuid,
//     boolean,
//   } from "drizzle-orm/pg-core";
  
//   export const twitSnapResponse = pgTable("twitsnaps_responses", {
//     id: uuid("id").defaultRandom().primaryKey(),
//     inResponseToId: uuid("in_response_to_id").notNull(),
//     message: varchar("content", { length: 280 }).notNull(),
//     createdAt: timestamp("created_at").defaultNow().notNull(),
//     isPrivate: boolean("is_private").default(false).notNull(),
//     createdBy: uuid("created_by").notNull(),
//   });
  
//   export type SelectTwitsnapResponse = typeof twitSnapResponse.$inferSelect;
//   export type InsertTwitsnapResponse = typeof twitSnapResponse.$inferInsert;
  