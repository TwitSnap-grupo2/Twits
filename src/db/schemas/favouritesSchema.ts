import { pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { twitSnap } from "./twisnapSchema";


export const favouritesTable = pgTable(
    "favourites",
    {
        twitsnapId: uuid("twitsnap_id")
            .references(() => twitSnap.id, { onDelete: "cascade" })
            .notNull(),
        userId: uuid("user_id").notNull(),
    },
    (table) => {
        return {
          pk: primaryKey({ columns: [table.twitsnapId, table.userId] }),
        };
    }
)

export type SelectFavourites = typeof favouritesTable.$inferSelect;
export type InserFavourites = typeof favouritesTable.$inferInsert;