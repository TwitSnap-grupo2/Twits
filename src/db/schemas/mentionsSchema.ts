import { pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { twitSnap } from "./twisnapSchema";

export const mentionsTable = pgTable(
    "mentions",
    {
        twitsnapId: uuid("twitsnap_id")
            .references(() => twitSnap.id, { onDelete: "cascade" })
            .notNull(),
        userMentionedId: uuid("user_mentioned").notNull(),
       
    },
    (table) => {
        return {
          pk: primaryKey({ columns: [table.twitsnapId, table.userMentionedId] }),
        };
    }
)

export type SelectMention = typeof mentionsTable.$inferSelect;
export type InsertMention = typeof mentionsTable.$inferInsert;