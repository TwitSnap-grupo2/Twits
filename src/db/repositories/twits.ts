import { v4 as uuid4 } from "uuid";
import {
  InsertTwitsnap,
  SelectTwitsnap,
  twitSnap as twitSnapsTable,
} from "../schemas/twisnapSchema";
import { db } from "../setup";
import { and, count, desc, eq, gt, gte, inArray, is, lt, sql} from "drizzle-orm";
import { LikeSchema, likeTwitSnapTable, SelectLike } from "../schemas/likeSchema";
import { InsertSnapshare, SelectSnapshare, snapshareTable } from "../schemas/snapshareSchema";
import {TwitsAndShares, TwitResponse} from "../schemas/twitsAndShares";
import { mentionsTable, SelectMention } from "../schemas/mentionsSchema";
import {hashtagTable, SelectHashtag} from "../schemas/hashtagSchema"
import { editTwitSnapSchema } from "../../utils/types";
import UserStats from "../schemas/statsSchema";
import { SelectTwitsnapResponse, twitSnapResponse } from "../schemas/twitsnapResponse";




const getTwitSnapsOrderedByDate = async (): Promise<Array<SelectTwitsnap>> => {
      return  db.select().from(twitSnapsTable).orderBy(desc(twitSnapsTable.createdAt)) 
  }


const getTwitSnapsByTwitId = async (id: string): Promise<SelectTwitsnap> => {
  return db.select().from(twitSnapsTable).where(eq(twitSnapsTable.id, id)).then((result) => result[0]);
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
    shares_count: sql<number>`(SELECT COUNT(*) FROM ${snapshareTable} WHERE ${snapshareTable.twitsnapId} = ${twitSnapsTable.id})`,
    responses_count: sql<number>`(SELECT COUNT(*) FROM ${twitSnapResponse} WHERE ${twitSnapResponse.inResponseToId} = ${twitSnapsTable.id})`
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
    shares_count: sql<number>`(SELECT COUNT(*) FROM ${snapshareTable} WHERE ${snapshareTable.twitsnapId} = ${twitSnapsTable.id})`,
    responses_count: sql<number>`(SELECT COUNT(*) FROM ${twitSnapResponse} WHERE ${twitSnapResponse.inResponseToId} = ${twitSnapsTable.id})`
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
    shares_count: sql<number>`(SELECT COUNT(*) FROM ${snapshareTable} WHERE ${snapshareTable.twitsnapId} = ${twitSnapsTable.id})`,
    responses_count: sql<number>`(SELECT COUNT(*) FROM ${twitSnapResponse} WHERE ${twitSnapResponse.inResponseToId} = ${twitSnapsTable.id})`
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
    shares_count: sql<number>`(SELECT COUNT(*) FROM ${snapshareTable} WHERE ${snapshareTable.twitsnapId} = ${twitSnapsTable.id})`,
    responses_count: sql<number>`(SELECT COUNT(*) FROM ${twitSnapResponse} WHERE ${twitSnapResponse.inResponseToId} = ${twitSnapsTable.id})`
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

const addHashtag = async (hashtag: string, twitsnap_id: string): Promise<SelectHashtag | null> => {
  return db.insert(hashtagTable).values({twitsnapId: twitsnap_id, name: hashtag.toLowerCase()}).returning().then((result) => (result.length > 0 ? result[0] : null));
}

const getTwitSnapHashtags = async (twitsnap_id: string): Promise<Array<SelectHashtag>> => {
  return db.select().from(hashtagTable).where(eq(hashtagTable.twitsnapId, twitsnap_id))
}

const deleteAllHashTags = async () => {
  await db.delete(hashtagTable);
}

const getTwitSnapsByHashtag = async (hashtag: string): Promise<Array<SelectTwitsnap>> => {
  const twits = await db.select({
    id: twitSnapsTable.id,
    message: twitSnapsTable.message,
    createdAt: twitSnapsTable.createdAt,
    createdBy: twitSnapsTable.createdBy,
    isPrivate: twitSnapsTable.isPrivate,
    likes_count: sql<number>`(SELECT COUNT(*) FROM ${likeTwitSnapTable} WHERE ${likeTwitSnapTable.twitsnapId} = ${twitSnapsTable.id})`,
    shares_count: sql<number>`(SELECT COUNT(*) FROM ${snapshareTable} WHERE ${snapshareTable.twitsnapId} = ${twitSnapsTable.id})`,
    responses_count: sql<number>`(SELECT COUNT(*) FROM ${twitSnapResponse} WHERE ${twitSnapResponse.inResponseToId} = ${twitSnapsTable.id})`
  }).from(twitSnapsTable)
    .innerJoin(hashtagTable, eq(twitSnapsTable.id, hashtagTable.twitsnapId))
    .where(eq(hashtagTable.name, hashtag))
    .orderBy(desc(twitSnapsTable.createdAt))
  return twits;
}

const searchHashtags = async (hashtag: string): Promise<Array<string>> => {
  const res = await db.execute(
    sql<Array<{ name: string }>>`
      SELECT name FROM hashtags 
      WHERE similarity(name, ${hashtag}) > ${0.1} 
      ORDER BY similarity(name, ${hashtag}) DESC
    `
  );

  return res.rows.map(row => row.name) as never;
}

const getTwitSnapsBySimilarity = async (q: string): Promise<Array<SelectTwitsnap>> => {
  const res = await db.execute(
    sql<string[]>`
      SELECT id FROM twitsnaps 
      WHERE similarity(content, ${q}) > ${0.1} 
      ORDER BY similarity(content, ${q}) DESC
    `
  );

  const ids = res.rows.map(row => row.id) as string[];
  return db.select({
    id: twitSnapsTable.id,
    message: twitSnapsTable.message,
    createdAt: twitSnapsTable.createdAt,
    createdBy: twitSnapsTable.createdBy,
    isPrivate: twitSnapsTable.isPrivate,
    likes_count: sql<number>`(SELECT COUNT(*) FROM ${likeTwitSnapTable} WHERE ${likeTwitSnapTable.twitsnapId} = ${twitSnapsTable.id})`,
    shares_count: sql<number>`(SELECT COUNT(*) FROM ${snapshareTable} WHERE ${snapshareTable.twitsnapId} = ${twitSnapsTable.id})`,
    responses_count: sql<number>`(SELECT COUNT(*) FROM ${twitSnapResponse} WHERE ${twitSnapResponse.inResponseToId} = ${twitSnapsTable.id})`

  })
  .from(twitSnapsTable)
  .where(inArray(twitSnapsTable.id, ids))
  .orderBy(desc(twitSnapsTable.createdAt));
}

const editTwitSnap = async (twitSnapId: string, twitSnap: editTwitSnapSchema): Promise<SelectTwitsnap | null> => {
  return db
    .update(twitSnapsTable)
    .set({
      message: twitSnap.message
    })
    .where(eq(twitSnapsTable.id, twitSnapId))
    .returning()
    .then((result) => (result.length > 0 ? result[0] : null));
}

const deleteHashtag = async (hashtag: string, twitsnap_id: string): Promise<void> => {
  if (!hashtag || !twitsnap_id) {
    throw new Error("invalid parameters")
  }
  const res = await db.delete(hashtagTable).where(and(eq(hashtagTable.twitsnapId, twitsnap_id), eq(hashtagTable.name, hashtag)))
  .returning()
  if (res.length === 0) {
    throw new Error("Hashtag not found")
  }
}

const getUserStats = async (userId: string, timestamp: Date): Promise<UserStats> => {
  const twitsTotal = await db.select({count: count()}).from(twitSnapsTable).where(and(eq(twitSnapsTable.createdBy, userId), gte(twitSnapsTable.createdAt, timestamp))).then((result) => result[0].count);
  const likesTotal = await db.select({count: count()}).from(twitSnapsTable).innerJoin(likeTwitSnapTable, eq(twitSnapsTable.id, likeTwitSnapTable.twitsnapId)).where(and(eq(twitSnapsTable.createdBy, userId), gte(twitSnapsTable.createdAt, timestamp))).then((result) => result[0].count);
  const sharesTotal = await db.select({count: count()}).from(twitSnapsTable).innerJoin(snapshareTable, eq(twitSnapsTable.id, snapshareTable.twitsnapId)).where(and(eq(twitSnapsTable.createdBy, userId), gte(twitSnapsTable.createdAt, timestamp))).then((result) => result[0].count);
  const responsesTotal = await db.select({count: count()}).from(twitSnapsTable).innerJoin(twitSnapResponse, eq(twitSnapsTable.id, twitSnapResponse.inResponseToId)).where(and(eq(twitSnapsTable.createdBy, userId), gte(twitSnapsTable.createdAt, timestamp))).then((result) => result[0].count);
  return {twitsTotal, likesTotal, sharesTotal, responsesTotal};
}

const addRawTwitSnapForTesting = async (twitSnap: InsertTwitsnap): Promise<SelectTwitsnap | null> => {
  return db
    .insert(twitSnapsTable)
    .values(twitSnap)
    .returning()
    .then((result) => (result.length > 0 ? result[0] : null));
}

const createResponse = async (twitsnapId: string, newTwitSnap: InsertTwitsnap): Promise<SelectTwitsnapResponse | null> => {
  const twitSnap = await getTwitSnapsByTwitId(twitsnapId);
  if (!twitSnap) {
    throw new Error("Twitsnap not found");
  }
  return db
    .insert(twitSnapResponse)
    .values({
      ...newTwitSnap,
      id: uuid4(),
      inResponseToId: twitsnapId,
    })
    .returning()
    .then((result) => (result.length > 0 ? result[0] : null));
}

const getTwitSnapResponses = async (twitsnapId: string): Promise<Array<TwitResponse>> => {
  return db
    .select({
      id: twitSnapResponse.id,
      message: twitSnapResponse.message,
      createdAt: twitSnapResponse.createdAt,
      createdBy: twitSnapResponse.createdBy,
      inResponseToId: twitSnapResponse.inResponseToId,
      isPrivate: twitSnapResponse.isPrivate,
      likes_count: sql<number>`(SELECT COUNT(*) FROM ${likeTwitSnapTable} WHERE ${likeTwitSnapTable.twitsnapId} = ${twitSnapResponse.id})`,
      responses_count: sql<number>`(SELECT COUNT(*) FROM ${twitSnapResponse} WHERE ${twitSnapResponse.inResponseToId} = ${twitSnapResponse.id})`,
      shares_count: sql<number>`(SELECT COUNT(*) FROM ${snapshareTable} WHERE ${snapshareTable.twitsnapId} = ${twitSnapResponse.id})`
    })
    .from(twitSnapResponse)
    .where(eq(twitSnapResponse.inResponseToId, twitsnapId))
    .orderBy(desc(twitSnapResponse.createdAt))
}

const deleteTwitSnapResponse = async (twitSnapId: string): Promise<void> => {
  const res = await db.delete(twitSnapResponse).where(eq(twitSnapResponse.inResponseToId, twitSnapId))
  .returning()
  if (res.length === 0) {
    throw new Error("TwitSnap response not found")
  }
}

const deleteAllTwitSnapResponses = async () => {
  await db.delete(twitSnapResponse);
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
  deleteTwitSnapMention,
  addHashtag,
  getTwitSnapHashtags,
  deleteAllHashTags,
  getTwitSnapsByHashtag,
  searchHashtags,
  getTwitSnapsBySimilarity,
  editTwitSnap,
  deleteHashtag,
  getTwitSnapsByTwitId,
  getUserStats,
  addRawTwitSnapForTesting,
  createResponse,
  getTwitSnapResponses,
  deleteTwitSnapResponse,
  deleteAllTwitSnapResponses

};
