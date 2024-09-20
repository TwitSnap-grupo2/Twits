import { v4 as uuid4 } from "uuid";
import {
  InsertTwitsnap,
  SelectTwitsnap,
  twitSnap as twitSnapsTable,
} from "../schemas/twisnapSchema";
import { db } from "../setup";
import { desc } from "drizzle-orm";

const getTwitSnapsOrderedByDate = async (): Promise<Array<SelectTwitsnap>> => {
  return await db
    .select()
    .from(twitSnapsTable)
    .orderBy(desc(twitSnapsTable.createdAt));
};

const createTwitSnap = async (
  newTwitSnap: InsertTwitsnap
): Promise<SelectTwitsnap | null> => {
  return db
    .insert(twitSnapsTable)
    .values({
      message: newTwitSnap.message,
      createdBy: newTwitSnap.createdBy,
      id: uuid4(),
    })
    .returning()
    .then((result) => (result.length > 0 ? result[0] : null));
};

export default {
  getTwitSnaps: getTwitSnapsOrderedByDate,
  createTwitSnap,
};
