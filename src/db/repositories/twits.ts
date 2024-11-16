import { v4 as uuid4 } from "uuid";


import {
  InsertTwitsnap,
  SelectTwitsnap,
  twitSnap as twitSnapsTable,
} from "../schemas/twisnapSchema";
import { db } from "../setup";
import { aliasedTable, and, count, desc, eq, gt, gte, inArray, is, isNotNull, isNull, lt, not, sql} from "drizzle-orm";
import { LikeSchema, likeTwitSnapTable, SelectLike } from "../schemas/likeSchema";
import { InsertSnapshare, SelectSnapshare, snapshareTable } from "../schemas/snapshareSchema";
import {TwitsAndShares} from "../schemas/twitsAndShares";
import { mentionsTable, SelectMention } from "../schemas/mentionsSchema";
import {hashtagTable, SelectHashtag} from "../schemas/hashtagSchema"
import { editTwitSnapSchema } from "../../utils/types";
import UserStats from "../schemas/statsSchema";
import { ErrorWithStatusCode } from "../../utils/errors";




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
    parentId: twitSnapsTable.parentId,
    likesCount:  sql<number>`0`,
    sharesCount: sql<number>`0`,
    repliesCount: sql<number>`0`
  }).from(twitSnapsTable)
    .where(eq(twitSnapsTable.createdBy, id))
    .orderBy(desc(twitSnapsTable.createdAt))  

  const retweetedTwits = await db.select({
    id: twitSnapsTable.id,
    message: twitSnapsTable.message,
    createdBy: twitSnapsTable.createdBy,
    sharedBy: snapshareTable.sharedBy,
    createdAt: snapshareTable.sharedAt,
    parentId: twitSnapsTable.parentId,
    isPrivate: twitSnapsTable.isPrivate,
    likesCount:  sql<number>`0`,
    sharesCount: sql<number>`0`,
    repliesCount: sql<number>`0`
  }).from(snapshareTable)
    .innerJoin(twitSnapsTable, eq(snapshareTable.twitsnapId, twitSnapsTable.id))
    .where(and(eq(snapshareTable.sharedBy, id), isNotNull(twitSnapsTable.message)))
    .orderBy(desc(snapshareTable.sharedAt))

  const combinedTwits = [...originalTwits, ...retweetedTwits];
  combinedTwits.sort((a, b) => {
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  for (const twit of combinedTwits) {
    twit.likesCount = await getLikesCount(twit.id);
    twit.sharesCount = await getSharesCount(twit.id);
    twit.repliesCount = await getRepliesCount(twit.id);
  }
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
    throw new ErrorWithStatusCode("LikeError", "TwitSnap like not found", 404);
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
    parentId: twitSnapsTable.parentId,
    likesCount:  sql<number>`0`,
    sharesCount: sql<number>`0`,
    repliesCount: sql<number>`0`
  }).from(twitSnapsTable)
    .where(and(lt(twitSnapsTable.createdAt, timestamp_start), inArray(twitSnapsTable.createdBy, followeds), isNotNull(twitSnapsTable.message), isNull(twitSnapsTable.parentId)))
    .orderBy(desc(twitSnapsTable.createdAt))
    .limit(limit);
  
  const retweetedTwits = await db.select({
    id: twitSnapsTable.id,
    message: twitSnapsTable.message,
    createdBy: twitSnapsTable.createdBy,
    sharedBy: snapshareTable.sharedBy,
    createdAt: snapshareTable.sharedAt,
    isPrivate: twitSnapsTable.isPrivate,
    parentId: twitSnapsTable.parentId,
    likesCount:  sql<number>`0`,
    sharesCount: sql<number>`0`,
    repliesCount: sql<number>`0`
  }).from(snapshareTable)
    .innerJoin(twitSnapsTable, eq(snapshareTable.twitsnapId, twitSnapsTable.id))
    .where(and(lt(snapshareTable.sharedAt, timestamp_start), inArray(snapshareTable.sharedBy, followeds), isNotNull(twitSnapsTable.message), isNull(twitSnapsTable.parentId)))
    .orderBy(desc(snapshareTable.sharedAt))
    .limit(limit);

  const combinedTwits = [...originalTwits, ...retweetedTwits];
  combinedTwits.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  combinedTwits.splice(limit);
  
  for (const twit of combinedTwits) {
    twit.likesCount = await getLikesCount(twit.id);
    twit.sharesCount = await getSharesCount(twit.id);
    twit.repliesCount = await getRepliesCount(twit.id);
  }

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

const getTwitSnapsByHashtag = async (hashtag: string): Promise<Array<TwitsAndShares>> => {
  const twits = await db.select({
    id: twitSnapsTable.id,
    message: twitSnapsTable.message,
    createdAt: twitSnapsTable.createdAt,
    createdBy: twitSnapsTable.createdBy,
    isPrivate: twitSnapsTable.isPrivate,
    sharedBy: sql<string | null>`NULL`,
    parentId: twitSnapsTable.parentId,
    likesCount:  sql<number>`0`,
    sharesCount: sql<number>`0`,
    repliesCount: sql<number>`0`
  }).from(twitSnapsTable)
    .innerJoin(hashtagTable, eq(twitSnapsTable.id, hashtagTable.twitsnapId))
    .where(eq(hashtagTable.name, hashtag.toLowerCase()))
    .orderBy(desc(twitSnapsTable.createdAt))

  for (const twit of twits) {
    twit.likesCount = await getLikesCount(twit.id);
    twit.sharesCount = await getSharesCount(twit.id);
    twit.repliesCount = await getRepliesCount(twit.id);
  }
  return twits;
}

const searchHashtags = async (hashtag: string): Promise<Array<string>> => {
  const res = await db.execute(
    sql<Array<{ name: string }>>`
      SELECT name FROM hashtags 
      WHERE similarity(name, ${hashtag.toLowerCase()}) > ${0.1} 
      ORDER BY similarity(name, ${hashtag.toLowerCase()}) DESC
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
    parentId: twitSnapsTable.parentId,
    

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

const getUserStatsFiltered = async (userId: string, timestamp: Date): Promise<UserStats> => {
  const table2 = aliasedTable(twitSnapsTable, "table2");
  const twitsTotal = await db.select({count: count()}).from(twitSnapsTable).where(and(eq(twitSnapsTable.createdBy, userId), gte(twitSnapsTable.createdAt, timestamp))).then((result) => result[0].count);
  const likesTotal = await db.select({count: count()}).from(twitSnapsTable).innerJoin(likeTwitSnapTable, eq(twitSnapsTable.id, likeTwitSnapTable.twitsnapId)).where(and(eq(twitSnapsTable.createdBy, userId), gte(twitSnapsTable.createdAt, timestamp))).then((result) => result[0].count);
  const sharesTotal = await db.select({count: count()}).from(twitSnapsTable).innerJoin(snapshareTable, eq(twitSnapsTable.id, snapshareTable.twitsnapId)).where(and(eq(twitSnapsTable.createdBy, userId), gte(twitSnapsTable.createdAt, timestamp))).then((result) => result[0].count);
  const repliesTotal = await db.select({count: count()}).from(twitSnapsTable).innerJoin(table2, eq(table2.parentId, twitSnapsTable.id)).where(and(eq(twitSnapsTable.createdBy, userId), gte(twitSnapsTable.createdAt, timestamp))).then((result) => result[0].count);
  return {twitsTotal, likesTotal, sharesTotal, repliesTotal};
}

const getTotalUserStats = async (userId: string): Promise<UserStats> => {
  const table2 = aliasedTable(twitSnapsTable, "table2");
  const twitsTotal = await db.select({count: count()}).from(twitSnapsTable).where(eq(twitSnapsTable.createdBy, userId)).then((result) => result[0].count);
  const likesTotal = await db.select({count: count()}).from(twitSnapsTable).innerJoin(likeTwitSnapTable, eq(twitSnapsTable.id, likeTwitSnapTable.twitsnapId)).where(eq(twitSnapsTable.createdBy, userId)).then((result) => result[0].count);
  const sharesTotal = await db.select({count: count()}).from(twitSnapsTable).innerJoin(snapshareTable, eq(twitSnapsTable.id, snapshareTable.twitsnapId)).where(eq(twitSnapsTable.createdBy, userId)).then((result) => result[0].count);
  const repliesTotal = await db.select({count: count()}).from(twitSnapsTable).innerJoin(table2, eq(table2.parentId, twitSnapsTable.id)).where(eq(twitSnapsTable.createdBy, userId)).then((result) => result[0].count);
  return {twitsTotal, likesTotal, sharesTotal, repliesTotal};
}

const addRawTwitSnapForTesting = async (twitSnap: InsertTwitsnap): Promise<SelectTwitsnap | null> => {
  return db
    .insert(twitSnapsTable)
    .values(twitSnap)
    .returning()
    .then((result) => (result.length > 0 ? result[0] : null));
}

const createReply = async (twitsnapId: string, newTwitSnap: InsertTwitsnap): Promise<SelectTwitsnap | null> => {
  const twitSnap = await getTwitSnapsByTwitId(twitsnapId);
  if (!twitSnap) {
    throw new ErrorWithStatusCode("ReplyError", "TwitSnap not found", 404);
  }
  return db
    .insert(twitSnapsTable)
    .values({
      ...newTwitSnap,
      parentId: twitsnapId,
    })
    .returning()
    .then((result) => (result.length > 0 ? result[0] : null));
}

const getTwitSnapReplies = async (twitsnapId: string): Promise<Array<SelectTwitsnap>> => {
  const res = await db
    .select({
      id: twitSnapsTable.id,
      message: twitSnapsTable.message,
      createdAt: twitSnapsTable.createdAt,
      createdBy: twitSnapsTable.createdBy,
      parent: twitSnapsTable.parentId,
      isPrivate: twitSnapsTable.isPrivate,
      parentId: twitSnapsTable.parentId,
      likesCount: sql<number>`0`,
      sharesCount: sql<number>`0`,
      repliesCount: sql<number>`0`
    })
    .from(twitSnapsTable)
    .where(eq(twitSnapsTable.parentId, twitsnapId))
    .orderBy(desc(twitSnapsTable.createdAt))

  for (const twit of res) {
    twit.likesCount = await getLikesCount(twit.id);
    twit.sharesCount = await getSharesCount(twit.id);
    twit.repliesCount = await getRepliesCount(twit.id);
  }
  return res;
    

}

const getLikesCount = async (twitId: string) => {
  const result = await db.select({count: count()})
    .from(likeTwitSnapTable)
    .where(eq(likeTwitSnapTable.twitsnapId, twitId));
  return result[0]?.count || 0;
};

const getSharesCount = async (twitId: string) => {
  const result = await db.select({count: count()})
    .from(snapshareTable)
    .where(eq(snapshareTable.twitsnapId, twitId));
  return result[0]?.count || 0;
};

const getRepliesCount = async (twitId: string) => {
  const result = await db.select({count: count()})
    .from(twitSnapsTable)
    .where(eq(twitSnapsTable.parentId, twitId));
  return result[0]?.count || 0;
};

const deleteReply = async(twitSnapId: string) => {
  await db.update(twitSnapsTable).set({message: null}).where(eq(twitSnapsTable.id, twitSnapId));
}

const deleteTwitSnap = async (id: string): Promise<void> => { 
  const res = await db.delete(twitSnapsTable).where(eq(twitSnapsTable.id, id)).returning();
  if (res.length === 0) {
    throw new ErrorWithStatusCode("TwitSnapError", "TwitSnap not found", 404);
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
  getUserStatsFiltered,
  getTotalUserStats,
  addRawTwitSnapForTesting,
  createReply,
  getTwitSnapReplies,
  deleteReply,
  deleteTwitSnap
};


