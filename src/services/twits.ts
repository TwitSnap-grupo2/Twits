import { get } from "https";
import db from "../db/repositories/twits";
import { LikeSchema, SelectLike } from "../db/schemas/likeSchema";
import { InsertTwitsnap, SelectTwitsnap } from "../db/schemas/twisnapSchema";
import { InsertSnapshare, SelectSnapshare } from "../db/schemas/snapshareSchema";

const getTwitSnaps = async (): Promise<Array<TwitsAndShares>> => {
  return await db.getTwitSnaps();
};

const getTwitSnap = async (id: string): Promise<Array<SelectTwitsnap>> => {
  return await db.getTwitSnap(id);
}

const createTwitSnap = async (
  newTwitSnap: InsertTwitsnap
): Promise<SelectTwitsnap | null> => {
  return await db.createTwitSnap(newTwitSnap);
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

export default {
  getTwitSnaps,
  createTwitSnap,
  likeTwitSnap,
  getTwitSnap,
  getTwitSnapLikes,
  deleteTwitSnapLike,
  createSnapshare,
};
