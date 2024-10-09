import { pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { twitSnap } from "./twisnapSchema";


export const snapshareTable = pgTable(
    "snapshares",
    {
        twitsnapId: uuid("twitsnap_id")
            .references(() => twitSnap.id, { onDelete: "cascade" })
            .notNull(),
        sharedBy: uuid("shared_by").notNull(),
        sharedAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => {
        return {
          pk: primaryKey({ columns: [table.twitsnapId, table.sharedBy] }),
        };
    }
)

export type SelectSnapshare = typeof snapshareTable.$inferSelect;
export type InsertSnapshare = typeof snapshareTable.$inferInsert;