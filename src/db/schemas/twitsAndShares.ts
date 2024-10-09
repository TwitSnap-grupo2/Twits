// import {
//     pgTable,
//     varchar,
//     timestamp,
//     uuid,
//     boolean,
//   } from "drizzle-orm/pg-core";

// export const twitsAndShares = pgTable("twitsAndShares", {
//     id: uuid("id").defaultRandom().primaryKey(),
//     message: varchar("content", { length: 280 }).notNull(),
//     createdAt: timestamp("created_at").notNull(),
//     createdBy: uuid("created_by").notNull(),
//     sharedBy: uuid("shared_by"),

// });

// export type SelectTwitsAndShares = typeof twitsAndShares.$inferSelect;


type TwitsAndShares = {
    id: string;
    message: string;
    createdAt: Date;
    createdBy: string;
    sharedBy: string | null;
    isPrivate: boolean;
    likes_count: number;
    shares_count: number;
  }

export default TwitsAndShares;