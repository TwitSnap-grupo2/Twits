import { get } from "https";
import db from "../db/repositories/twits";
import { LikeSchema, SelectLike } from "../db/schemas/likeSchema";
import { InsertTwitsnap, SelectTwitsnap } from "../db/schemas/twisnapSchema";
import { InsertSnapshare, SelectSnapshare } from "../db/schemas/snapshareSchema";
import TwitsAndShares from "../db/schemas/twitsAndShares";
import { SelectMention } from "../db/schemas/mentionsSchema";

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
      const _ = await db.addHashtag(word, res?.id)
    }
  }
  return res
};

const likeTwitSnap = async( newLike: LikeSchema): Promise<SelectLike> => {
  const result = await db.likeTwitSnap(newLike);
  if (!result){
    throw new Error("TwitSnap not found");
  }
  return result;
}

const getTwitSnapLikes = async (getLike: string): Promise<Array<SelectLike>> => {
  return await db.getTwitSnapLikes(getLike);
}

const deleteTwitSnapLike = async(like: LikeSchema): Promise<void> => {
  return await db.deleteTwitSnapLike(like);
}

const createSnapshare = async (newSnapshare: InsertSnapshare): Promise<SelectSnapshare> => {
  const result = await db.createSnapshare(newSnapshare);
  if (!result){
    throw new Error("TwitSnap not found");
  }
  return result;
}

const deleteSnapshare = async (snapshare: InsertSnapshare): Promise<void> => {
  return await db.deleteSnapshare(snapshare);
}

const getFeed = async (timestamp_start: Date, limit: number, followeds: Array<string>): Promise<Array<TwitsAndShares>> => {
  return await db.getFeed(timestamp_start, limit, followeds);
}

const mentionUser = async (twitSnap_id: string, mentionedUser: string): Promise<SelectMention> => {
  const result = await db.mentionUser(twitSnap_id, mentionedUser);
  if (!result){
    throw new Error("TwitSnap not found");
  }
  return result;
}

const getTwitSnapMentions = async (twitSnap_id: string): Promise<Array<SelectMention>> => {
  return await db.getTwitSnapMentions(twitSnap_id);
}

const deleteTwitSnapMention = async (twitSnap_id: string, mentionedUser: string): Promise<void> => {
  return await db.deleteTwitSnapMention(twitSnap_id, mentionedUser);
}

const getTwitSnapsByHashtag = async (hashtag: string): Promise<Array<SelectTwitsnap>> => {
  return await db.getTwitSnapsByHashtag(hashtag);
}

const searchHashtags = async (hashtag: string): Promise<Array<string>> => {
  return await db.searchHashtags(hashtag);
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
};
