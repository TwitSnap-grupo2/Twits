import { v4 as uuid4 } from "uuid";
import {
  InsertTwitsnap,
  SelectTwitsnap,
  twitSnap as twitSnapsTable,
} from "../schemas/twisnapSchema";
import { db } from "../setup";
import { and, desc, eq} from "drizzle-orm";
import { LikeSchema, likeTwitSnapTable, SelectLike } from "../schemas/likeSchema";

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

const likeTwitSnap = async (newLike: LikeSchema): Promise<SelectLike | null> => {

  return db
    .insert(likeTwitSnapTable)
    .values(newLike)
    .returning()
    .then((result) => (result.length > 0 ? result[0] : null));
}

const getTwitSnapLikes = async (twitsnapId: string): Promise<Array<SelectLike>> => {

  return db
    .select()
    .from(likeTwitSnapTable)
    .where(eq(likeTwitSnapTable.twitsnapId, twitsnapId))
}

const deleteTwitSnapLikes = async () => {
  await db.delete(likeTwitSnapTable)
};

const deleteTwitSnapLike = async (like: LikeSchema): Promise<void> => {
  if (!like.twitsnapId || !like.likedBy) {
    throw new Error("invalid parameters")
  }
  const res = await db.delete(likeTwitSnapTable).where(and(eq(likeTwitSnapTable.twitsnapId, like.twitsnapId), eq(likeTwitSnapTable.likedBy, like.likedBy)))
  .returning()
  if (res.length === 0) {
    throw new Error("TwitSnap like not found")
  }

}


export default {
  getTwitSnaps: getTwitSnapsOrderedByDate,
  getTwitSnap,
  createTwitSnap,
  deleteTwitsnaps,
  likeTwitSnap,
  deleteTwitSnapLikes, 
  getTwitSnapLikes,
  deleteTwitSnapLike
};
