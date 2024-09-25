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


  const result = await getTwitSnapLike(newLike)
  console.log(result)
  if (result.length > 0) {
    throw new Error("Already liked")
  }

  return db
    .insert(likeTwitSnapTable)
    .values(newLike)
    .returning()
    .then((result) => (result.length > 0 ? result[0] : null));
}

const getTwitSnapLike = async (getLike: LikeSchema): Promise<Array<SelectLike>> => {
  if (!getLike.twitsnapId || !getLike.likedBy) {
    throw new Error("invalid parameters")
  }
  return db
    .select()
    .from(likeTwitSnapTable)
    .where(and(eq(likeTwitSnapTable.twitsnapId, getLike.twitsnapId), eq(likeTwitSnapTable.likedBy, getLike.likedBy)))
}

const deleteTwitSnapLikes = async () => {
  await db.delete(likeTwitSnapTable)
};

export default {
  getTwitSnaps: getTwitSnapsOrderedByDate,
  getTwitSnap,
  createTwitSnap,
  deleteTwitsnaps,
  likeTwitSnap,
  deleteTwitSnapLikes, 
  getTwitSnapLike,
};
