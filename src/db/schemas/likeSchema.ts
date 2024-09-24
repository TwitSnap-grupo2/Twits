import {pgTable, primaryKey, uuid} from "drizzle-orm/pg-core";
import { twitSnap } from "./twisnapSchema";

export const likeTwitSnapSchema = pgTable(
    "likes",
    {
      twitsnapId: uuid("twitsnap_id")
        .references(() => twitSnap.id, { onDelete: "cascade" })
        .notNull(),
      likedBy: uuid("liked_by"),
    },
    (table) => {
      return {
        pk: primaryKey({ columns: [table.twitsnapId, table.likedBy] }),
      };
    }
  );

export type SelectLike = typeof likeTwitSnapSchema.$inferSelect;
export type InsertLike = typeof likeTwitSnapSchema.$inferInsert;