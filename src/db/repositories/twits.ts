import { v4 as uuid4 } from "uuid";
import {
  InsertTwitsnap,
  SelectTwitsnap,
  twitSnap as twitSnapsTable,
} from "../schemas/twisnapSchema";
import { db } from "../setup";
import { desc, eq} from "drizzle-orm";
import { InsertLike, likeTwitSnapSchema, SelectLike } from "../schemas/likeSchema";

const getTwitSnapsOrderedByDate = async (): Promise<Array<SelectTwitsnap>> => {
  return await db
    .select()
    .from(twitSnapsTable)
    .orderBy(desc(twitSnapsTable.createdAt));
};

const getTwitSnap = async (id: string): Promise<Array<SelectTwitsnap>> => {
  return db
    .select()
    .from(twitSnapsTable)
    .where(eq(twitSnapsTable.createdBy, id))
    .orderBy(desc(twitSnapsTable.createdAt))
};

const createTwitSnap = async (
  newTwitSnap: InsertTwitsnap
): Promise<SelectTwitsnap | null> => {
  return db
    .insert(twitSnapsTable)
    .values({
      ...newTwitSnap,
      id: uuid4(),
    })
    .returning()
    .then((result) => (result.length > 0 ? result[0] : null));
};

const deleteTwitsnaps = async () => {
  await db.delete(twitSnapsTable);
};

const likeTwitSnap = async (newLike: InsertLike): Promise<SelectLike | null> => {
  return db
    .insert(likeTwitSnapSchema)
    .values(newLike)
    .returning()
    .then((result) => (result.length > 0 ? result[0] : null));
}

export default {
  getTwitSnaps: getTwitSnapsOrderedByDate,
  getTwitSnap,
  createTwitSnap,
  deleteTwitsnaps,
  likeTwitSnap,
};
