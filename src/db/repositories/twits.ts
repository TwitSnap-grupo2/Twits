import { v4 as uuid4 } from "uuid";
import {
  InsertTwitsnap,
  SelectTwitsnap,
  twitSnap as twitSnapsTable,
} from "../schemas/twisnapSchema";
import { db } from "../setup";
import { and, desc, eq, gt, gte, lt, sql} from "drizzle-orm";
import { LikeSchema, likeTwitSnapTable, SelectLike } from "../schemas/likeSchema";
import { InsertSnapshare, SelectSnapshare, snapshareTable } from "../schemas/snapshareSchema";
import TwitsAndShares from "../schemas/twitsAndShares";




const getTwitSnapsOrderedByDate = async (): Promise<Array<SelectTwitsnap>> => {
//   const originalTwits = await db.select({
//   id: twitSnapsTable.id,
//   message: twitSnapsTable.message,
//   createdAt: twitSnapsTable.createdAt,
//   createdBy: twitSnapsTable.createdBy,
//   sharedBy: sql<string | null>`NULL`
// }).from(twitSnapsTable);

//   const retweetedTwits = await db.select({
//     id: twitSnapsTable.id,
//     message: twitSnapsTable.message,
//     createdBy: twitSnapsTable.createdBy,
//     sharedBy: snapshareTable.sharedBy,
//     createdAt: snapshareTable.sharedAt,
//   }).from(snapshareTable)
//     .innerJoin(twitSnapsTable, eq(snapshareTable.twitsnapId, twitSnapsTable.id))
//     .orderBy(desc(snapshareTable.sharedAt))

//     const combinedTwits = [...originalTwits, ...retweetedTwits];
//     combinedTwits.sort((a, b) => {
//       return b.createdAt.getTime() - a.createdAt.getTime();
//     });
//     return combinedTwits;
        return  db.select().from(twitSnapsTable).orderBy(desc(twitSnapsTable.createdAt)) 
  }

    


const getTwitSnap = async (id: string): Promise<Array<SelectTwitsnap>> => {
  return db
    .select()
    .from(twitSnapsTable)
    .where(eq(twitSnapsTable.createdBy, id))
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

const deleteAllTwitSnapLikes = async () => {
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

const createSnapshare = async (newSnapshare: InsertSnapshare): Promise<SelectSnapshare | null> => {
  return db
    .insert(snapshareTable)
    .values(newSnapshare)
    .returning()
    .then((result) => (result.length > 0 ? result[0] : null));
}

const deleteSnapshares = async () => {
  await db.delete(snapshareTable);
}

const deleteSnapshare = async (snapshare: InsertSnapshare): Promise<void> => {
  if (!snapshare.twitsnapId || !snapshare.sharedBy) {
    throw new Error("invalid parameters")
  }
  const res = await db.delete(snapshareTable).where(and(eq(snapshareTable.twitsnapId, snapshare.twitsnapId), eq(snapshareTable.sharedBy, snapshare.sharedBy)))
  .returning()
  if (res.length === 0) {
    throw new Error("Snapshare not found")
  }
}

const getFeed = async (timestamp_start: Date, limit: number): Promise<Array<TwitsAndShares>> => {
  const originalTwits = await db.select({
    id: twitSnapsTable.id,
    message: twitSnapsTable.message,
    createdAt: twitSnapsTable.createdAt,
    createdBy: twitSnapsTable.createdBy,
    sharedBy: sql<string | null>`NULL`,
    isPrivate: twitSnapsTable.isPrivate
  }).from(twitSnapsTable)
    .where(lt(twitSnapsTable.createdAt, timestamp_start))
    .orderBy(desc(twitSnapsTable.createdAt))
    .limit(limit);
  

  const retweetedTwits = await db.select({
    id: twitSnapsTable.id,
    message: twitSnapsTable.message,
    createdBy: twitSnapsTable.createdBy,
    sharedBy: snapshareTable.sharedBy,
    createdAt: snapshareTable.sharedAt,
    isPrivate: twitSnapsTable.isPrivate
  }).from(snapshareTable)
    .innerJoin(twitSnapsTable, eq(snapshareTable.twitsnapId, twitSnapsTable.id))
    .where(lt(snapshareTable.sharedAt, timestamp_start))
    .orderBy(desc(snapshareTable.sharedAt))
    .limit(limit);

  console.log(retweetedTwits);
  const combinedTwits = [...originalTwits, ...retweetedTwits];
  combinedTwits.sort((a, b) => {
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
  combinedTwits.splice(limit);
  return combinedTwits;
}


export default {
  getTwitSnaps: getTwitSnapsOrderedByDate,
  getTwitSnap,
  createTwitSnap,
  deleteTwitsnaps,
  likeTwitSnap,
  deleteAllTwitSnapLikes, 
  getTwitSnapLikes,
  deleteTwitSnapLike,
  createSnapshare,
  deleteSnapshares,
  deleteSnapshare,
  getFeed
};
