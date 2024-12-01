import { get } from "https";
import db from "../db/repositories/twits";
import { LikeSchema, SelectLike } from "../db/schemas/likeSchema";
import { InsertTwitsnap, SelectTwitsnap } from "../db/schemas/twisnapSchema";
import { InsertSnapshare, SelectSnapshare } from "../db/schemas/snapshareSchema";
import {TwitsAndShares} from "../db/schemas/twitsAndShares";
import { SelectMention } from "../db/schemas/mentionsSchema";
import { editTwitSnapSchema, HashtagMetrics, Metrics } from "../utils/types";
import UserStats from "../db/schemas/statsSchema";
import { ErrorWithStatusCode } from "../utils/errors";
import { SelectFavourites } from "../db/schemas/favouritesSchema";

const getTwitSnaps = async (): Promise<Array<SelectTwitsnap>> => {
  return await db.getTwitSnaps();
};

const getTwitSnapsById = async (id: string): Promise<Array<TwitsAndShares>> => {
  return await db.getTwitSnapsById(id);
}

const createTwitSnap = async (
  newTwitSnap: InsertTwitsnap
): Promise<SelectTwitsnap | null> => {
  const res = await db.createTwitSnap(newTwitSnap);
  if (!res?.id || !newTwitSnap.message){
    return null
  }
  if(newTwitSnap.parentId){
    const parent = await db.getTwitSnapsByTwitId(newTwitSnap.parentId)
    if(!parent){
      throw new ErrorWithStatusCode("TwitSnapError", "TwitSnap not found", 404
      );
  }
}
  for(const word of newTwitSnap.message.split(" ")){
    if(word.charAt(0) === "#"){
      const _ = await db.addHashtag(word.slice(1), res?.id)
    }
  }
  return res
};

const deleteTwitSnap = async (id: string): Promise<void> => {
  const res = await db.getTwitSnapsByTwitId(id);
  if (!res || !res.message){
    throw new ErrorWithStatusCode("TwitSnapError", "TwitSnap not found", 404);
  }
  if (res.parentId){
    return await db.deleteReply(id);
    
  }
  return await db.deleteTwitSnap(id);
}

const likeTwitSnap = async( newLike: LikeSchema): Promise<SelectLike| null> => {
  try {
    return await db.likeTwitSnap(newLike);
  } catch (error:any) {
    if (error.name == "NeonDbError") {
      if(error.code == "23505"){
        throw new ErrorWithStatusCode("LikeError", "TwitSnap like already exists", 400);
      } else if (error.code == "23503"){
      throw new ErrorWithStatusCode("LikeError", "TwitSnap not found", 404);
      }
   }
    throw error;
  }
}

const createReply = async (twitSnapId: string, newReply: InsertTwitsnap): Promise<SelectTwitsnap | null> => {
  return await db.createReply(twitSnapId, newReply);
}

const getTwitSnapReplies = async (twitSnapId: string): Promise<Array<SelectTwitsnap>> => {
  return await db.getTwitSnapReplies(twitSnapId);
}

const getTwitSnapLikes = async (getLike: string): Promise<Array<SelectLike>> => {
  return await db.getTwitSnapLikes(getLike);
}

const deleteTwitSnapLike = async(like: LikeSchema): Promise<void> => {
  return await db.deleteTwitSnapLike(like);
 
}

const createSnapshare = async (newSnapshare: InsertSnapshare): Promise<SelectSnapshare| null> => {
  try {
    return await db.createSnapshare(newSnapshare);
  } catch (error: any) {
    if (error.name == "NeonDbError") {
      if(error.code == "23505"){
        throw new ErrorWithStatusCode("SnapshareError", "TwitSnap share already exists", 400);
      } else if (error.code == "23503"){
      throw new ErrorWithStatusCode("SnapshareError", "TwitSnap not found", 404);
      }
   }
    throw error;
  }
}

const deleteSnapshare = async (snapshare: InsertSnapshare): Promise<void> => {
  return await db.deleteSnapshare(snapshare);
}

const getFeed = async (timestamp_start: Date, limit: number, followeds: Array<string>): Promise<Array<TwitsAndShares>> => {
  return await db.getFeed(timestamp_start, limit, followeds);
}

const mentionUser = async (twitSnap_id: string, mentionedUser: string): Promise<SelectMention | null> => {
  try {
    return await db.mentionUser(twitSnap_id, mentionedUser);
  }catch (e:any){
    if (e.name == "NeonDbError") {
      if(e.code == "23505"){
        throw new ErrorWithStatusCode("MentionError", "TwitSnap mention already exists", 400);
      } else if (e.code == "23503"){
      throw new ErrorWithStatusCode("MentionError", "TwitSnap not found", 404);
      }
   }
    throw e;
  }
}

const getTwitSnapMentions = async (twitSnap_id: string): Promise<Array<SelectMention>> => {
  return await db.getTwitSnapMentions(twitSnap_id);
}

const deleteTwitSnapMention = async (twitSnap_id: string, mentionedUser: string): Promise<void> => {
  return await db.deleteTwitSnapMention(twitSnap_id, mentionedUser);
}

const getTwitSnapsByHashtag = async (hashtag: string): Promise<Array<TwitsAndShares>> => {
  return await db.getTwitSnapsByHashtag(hashtag);
}

const searchHashtags = async (hashtag: string): Promise<Array<string>> => {
  return await db.searchHashtags(hashtag);
}

const getTwitSnapsBySimilarity = async (q: string): Promise<Array<SelectTwitsnap>> => {
  return db.getTwitSnapsBySimilarity(q);
} 

const editTwitSnap = async (twitSnapId: string, twitSnap: editTwitSnapSchema): Promise<SelectTwitsnap> => {
  const previousTwitSnap = await db.getTwitSnapsByTwitId(twitSnapId);
  if (!previousTwitSnap || !previousTwitSnap.message){
    throw new ErrorWithStatusCode("TwitSnapError", "TwitSnap not found", 404);
  }
  const result = await db.editTwitSnap(twitSnapId, twitSnap);
  if (!result || !result.message){
    throw new ErrorWithStatusCode("TwitSnapError", "TwitSnap not found", 404);
  }
  for(const word of result.message.split(" ")){
    if(word.charAt(0) === "#"){
      if(!previousTwitSnap.message.includes(word)){
      const _ = await db.addHashtag(word.slice(1), twitSnapId)
      }
    }
  }
  for(const word of previousTwitSnap.message.split(" ")){
    if(word.charAt(0) === "#"){
      if(!result.message.includes(word)){
        const _ = await db.deleteHashtag(word.slice(1), twitSnapId)
      }
    }
  }
  return result;
}

const getUserStats = async (userId: string, limit: number | undefined): Promise<UserStats> => {
  if(limit && limit > 0){
    const timestampLimit = new Date();
    timestampLimit.setDate(timestampLimit.getDate() - limit);
    return db.getUserStatsFiltered(userId, timestampLimit);
  }
  return db.getTotalUserStats(userId);
  
}

const getMetrics = async (range: string): Promise<Metrics> => {
  const limitDate = getLimitDateByRange(range);
  const res =  db.getMetrics(range, limitDate);
  return res;

}

const getHashtagMetrics = async (hashtag: string | undefined, range: string): Promise<HashtagMetrics> => {
  const limitDate = getLimitDateByRange(range);
  if (!hashtag){
    const res =  db.getAllHashtagMetrics(range, limitDate);
    return res;
  } else{
    const res =  db.getHashtagMetrics(hashtag, range, limitDate);
    return res;
  }
}

function getLimitDateByRange(range: string) {
  const limitDate = new Date();
  if (range === "day") {
    limitDate.setDate(limitDate.getDate() - 1);
  }
  if (range === "week") {
    limitDate.setDate(limitDate.getDate() - 7);
  }
  if (range === "month") {
    limitDate.setDate(limitDate.getDate() - 30);
  }
  if (range === "year") {
    limitDate.setDate(limitDate.getDate() - 365);
  }
  return limitDate;
}

const blockTwitSnap = async (id: string): Promise<SelectTwitsnap> => {
  return await db.blockTwitSnap(id);
}


const unblockTwitSnap = async (id: string): Promise<SelectTwitsnap> => {
  return await db.unblockTwitSnap(id);
}

const postFavourite = async (twitId: string, userId: string): Promise<SelectFavourites> => {
  return await db.postFavourite(twitId, userId);
}

const deleteFavourite = async (twitId: string, userId: string): Promise<void> => {
  return await db.deleteFavourite(twitId, userId);
}

const getUserFavourites = async (userId: string) => {
  return await db.getUserFavourites(userId);
}

const getBlockedTwitSnaps = async (): Promise<Array<SelectTwitsnap>> => {
  return await db.getBlockedTwitSnaps();
}

export default {
  getTwitSnaps,
  createTwitSnap,
  likeTwitSnap,
  getTwitSnapsById,
  getTwitSnapLikes,
  deleteTwitSnapLike,
  createSnapshare,
  deleteSnapshare,
  getFeed,
  mentionUser,
  getTwitSnapMentions,
  deleteTwitSnapMention,
  getTwitSnapsByHashtag,
  searchHashtags,
  getTwitSnapsBySimilarity, 
  editTwitSnap,
  getUserStats,
  createReply,
  getTwitSnapReplies,
  deleteTwitSnap,
  getMetrics,
  getHashtagMetrics,
  blockTwitSnap,
  unblockTwitSnap,
  postFavourite,
  deleteFavourite,
  getUserFavourites,
  getBlockedTwitSnaps
};



