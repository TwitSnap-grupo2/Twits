import { index, pgTable, primaryKey, uuid, varchar } from "drizzle-orm/pg-core";
import { twitSnap } from "./twisnapSchema";

export const hashtag = pgTable(
  "hashtags",
  {
    twitsnapId: uuid("twitsnap_id")
      // Delete all entries of the specific twitsnapId if twitsnap gets deleted
      .references(() => twitSnap.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 100 }).notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.twitsnapId, table.name] }),
      idx: index("hashtag_twitsnap_idx").on(table.twitsnapId, table.name),
    };
  }
);

export type SelectHashtag = typeof hashtag.$inferSelect;
export type InsertHashtag = typeof hashtag.$inferInsert;
