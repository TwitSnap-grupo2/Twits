import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { twitSnap } from "./twisnapSchema";


export const snapshareTable = pgTable(
    "snapshares",
    {
        twitsnapId: uuid("twitsnap_id")
            .references(() => twitSnap.id, { onDelete: "cascade" })
            .notNull(),
        sharedBy: uuid("shared_by"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    }
)

export type SelectSnapshare = typeof snapshareTable.$inferSelect;
export type InsertSnapshare = typeof snapshareTable.$inferInsert;