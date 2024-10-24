import { v4 as uuid4 } from "uuid";
import {
  InsertTwitsnap,
  SelectTwitsnap,
  twitSnap as twitSnapsTable,
} from "../schemas/twisnapSchema";
import { db } from "../setup";
import { and, desc, eq, gt, gte, inArray, lt, sql} from "drizzle-orm";
import { LikeSchema, likeTwitSnapTable, SelectLike } from "../schemas/likeSchema";
import { InsertSnapshare, SelectSnapshare, snapshareTable } from "../schemas/snapshareSchema";
import TwitsAndShares from "../schemas/twitsAndShares";
import { mentionsTable, SelectMention } from "../schemas/mentionsSchema";




const getTwitSnapsOrderedByDate = async (): Promise<Array<SelectTwitsnap>> => {
      return  db.select().from(twitSnapsTable).orderBy(desc(twitSnapsTable.createdAt)) 
  }

    


const getTwitSnapsById = async (id: string): Promise<Array<TwitsAndShares>> => {
  const originalTwits = await db.select({
    id: twitSnapsTable.id,
    message: twitSnapsTable.message,
    createdAt: twitSnapsTable.createdAt,
    createdBy: twitSnapsTable.createdBy,
    sharedBy: sql<string | null>`NULL`,
    isPrivate: twitSnapsTable.isPrivate,
    likes_count: sql<number>`(SELECT COUNT(*) FROM ${likeTwitSnapTable} WHERE ${likeTwitSnapTable.twitsnapId} = ${twitSnapsTable.id})`,
    shares_count: sql<number>`(SELECT COUNT(*) FROM ${snapshareTable} WHERE ${snapshareTable.twitsnapId} = ${twitSnapsTable.id})`
  }).from(twitSnapsTable)
    .where(eq(twitSnapsTable.createdBy, id))
    .orderBy(desc(twitSnapsTable.createdAt))  

  const retweetedTwits = await db.select({
    id: twitSnapsTable.id,
    message: twitSnapsTable.message,
    createdBy: twitSnapsTable.createdBy,
    sharedBy: snapshareTable.sharedBy,
    createdAt: snapshareTable.sharedAt,
    isPrivate: twitSnapsTable.isPrivate,
    likes_count: sql<number>`(SELECT COUNT(*) FROM ${likeTwitSnapTable} WHERE ${likeTwitSnapTable.twitsnapId} = ${twitSnapsTable.id})`,
    shares_count: sql<number>`(SELECT COUNT(*) FROM ${snapshareTable} WHERE ${snapshareTable.twitsnapId} = ${twitSnapsTable.id})`
  }).from(snapshareTable)
    .innerJoin(twitSnapsTable, eq(snapshareTable.twitsnapId, twitSnapsTable.id))
    .where(eq(snapshareTable.sharedBy, id))
    .orderBy(desc(snapshareTable.sharedAt))

  const combinedTwits = [...originalTwits, ...retweetedTwits];
  combinedTwits.sort((a, b) => {
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
  return combinedTwits;
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

const getFeed = async (timestamp_start: Date, limit: number, followeds: Array<string>): Promise<Array<TwitsAndShares>> => {
  const originalTwits = await db.select({
    id: twitSnapsTable.id,
    message: twitSnapsTable.message,
    createdAt: twitSnapsTable.createdAt,
    createdBy: twitSnapsTable.createdBy,
    sharedBy: sql<string | null>`NULL`,
    isPrivate: twitSnapsTable.isPrivate,
    likes_count: sql<number>`(SELECT COUNT(*) FROM ${likeTwitSnapTable} WHERE ${likeTwitSnapTable.twitsnapId} = ${twitSnapsTable.id})`,
    shares_count: sql<number>`(SELECT COUNT(*) FROM ${snapshareTable} WHERE ${snapshareTable.twitsnapId} = ${twitSnapsTable.id})`
  }).from(twitSnapsTable)
    .where(and(lt(twitSnapsTable.createdAt, timestamp_start), inArray(twitSnapsTable.createdBy, followeds)))
    .orderBy(desc(twitSnapsTable.createdAt))
    .limit(limit);
  

  const retweetedTwits = await db.select({
    id: twitSnapsTable.id,
    message: twitSnapsTable.message,
    createdBy: twitSnapsTable.createdBy,
    sharedBy: snapshareTable.sharedBy,
    createdAt: snapshareTable.sharedAt,
    isPrivate: twitSnapsTable.isPrivate,
    likes_count: sql<number>`(SELECT COUNT(*) FROM ${likeTwitSnapTable} WHERE ${likeTwitSnapTable.twitsnapId} = ${twitSnapsTable.id})`,
    shares_count: sql<number>`(SELECT COUNT(*) FROM ${snapshareTable} WHERE ${snapshareTable.twitsnapId} = ${twitSnapsTable.id})`
  }).from(snapshareTable)
    .innerJoin(twitSnapsTable, eq(snapshareTable.twitsnapId, twitSnapsTable.id))
    .where(and(lt(snapshareTable.sharedAt, timestamp_start), inArray(snapshareTable.sharedBy, followeds)))
    .orderBy(desc(snapshareTable.sharedAt))
    .limit(limit);

  const combinedTwits = [...originalTwits, ...retweetedTwits];
  combinedTwits.sort((a, b) => {
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
  combinedTwits.splice(limit);
  return combinedTwits;
}

const mentionUser = async (twitSnap_id: string, mentionedUser: string): Promise<SelectMention | null> => {
  return db
    .insert(mentionsTable)
    .values({
      twitsnapId: twitSnap_id,
      userMentionedId: mentionedUser
    })
    .returning()
    .then((result) => (result.length > 0 ? result[0] : null));
}

const deleteMentions = async () => {
  await db.delete(mentionsTable);
}

const getTwitSnapMentions = async (twitSnap_id: string): Promise<Array<SelectMention>> => {
  return db
    .select()
    .from(mentionsTable)
    .where(eq(mentionsTable.twitsnapId, twitSnap_id))
}

const deleteTwitSnapMention = async (twitSnap_id: string, mentionedUser: string): Promise<void> => {
  if (!twitSnap_id || !mentionedUser) {
    throw new Error("invalid parameters")
  }
  const res = await db.delete(mentionsTable).where(and(eq(mentionsTable.twitsnapId, twitSnap_id), eq(mentionsTable.userMentionedId, mentionedUser)))
  .returning()
  if (res.length === 0) {
    throw new Error("TwitSnap mention not found")
  }
}


export default {
  getTwitSnaps: getTwitSnapsOrderedByDate,
  getTwitSnapsById,
  createTwitSnap,
  deleteTwitsnaps,
  likeTwitSnap,
  deleteAllTwitSnapLikes, 
  getTwitSnapLikes,
  deleteTwitSnapLike,
  createSnapshare,
  deleteSnapshares,
  deleteSnapshare,
  getFeed,
  mentionUser,
  deleteMentions,
  getTwitSnapMentions,
  deleteTwitSnapMention

};
