import { get } from "https";
import db from "../db/repositories/twits";
import { LikeSchema, SelectLike } from "../db/schemas/likeSchema";
import { InsertTwitsnap, SelectTwitsnap } from "../db/schemas/twisnapSchema";
import { InsertSnapshare, SelectSnapshare } from "../db/schemas/snapshareSchema";
import {TwitsAndShares, TwitResponse} from "../db/schemas/twitsAndShares";
import { SelectMention } from "../db/schemas/mentionsSchema";
import { editTwitSnapSchema } from "../utils/types";
import UserStats from "../db/schemas/statsSchema";
import { SelectTwitsnapResponse } from "../db/schemas/twitsnapResponses";
import { ErrorWithStatusCode } from "../utils/errors";

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
  if (!res?.id){
    return null
  }
  for(const word of newTwitSnap.message.split(" ")){
    if(word.charAt(0) === "#"){
      const _ = await db.addHashtag(word.slice(1), res?.id)
    }
  }
  return res
};

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

const createResponse = async (twitSnapId: string, newResponse: InsertTwitsnap): Promise<SelectTwitsnapResponse | null> => {
  return await db.createResponse(twitSnapId, newResponse);
}

const getTwitSnapResponses = async (twitSnapId: string): Promise<Array<TwitResponse>> => {
  return await db.getTwitSnapResponses(twitSnapId);
}

const editTwitSnapResponse = async (twitSnapId: string, newMessage: string):Promise<SelectTwitsnapResponse | null> => {
  return await db.editTwitSnapResponse(twitSnapId, newMessage)
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
  if (!previousTwitSnap){
    throw new ErrorWithStatusCode("TwitSnapError", "TwitSnap not found", 404);
  }
  const result = await db.editTwitSnap(twitSnapId, twitSnap);
  if (!result){
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

const getUserStats = async (userId: string, limit: number): Promise<UserStats> => {
  const timestamp_limit = new Date();
  timestamp_limit.setDate(timestamp_limit.getDate() - limit);
  return db.getUserStats(userId, timestamp_limit);
}

const deleteTwitSnapResponse = async (twitSnapId: string): Promise<void> => {
  return db.deleteTwitSnapResponse(twitSnapId);
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
  createResponse,
  getTwitSnapResponses,
  deleteTwitSnapResponse,
  editTwitSnapResponse
};
