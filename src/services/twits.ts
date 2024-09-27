import { get } from "https";
import db from "../db/repositories/twits";
import { LikeSchema, SelectLike } from "../db/schemas/likeSchema";
import { InsertTwitsnap, SelectTwitsnap } from "../db/schemas/twisnapSchema";

const getTwitSnaps = async (): Promise<Array<SelectTwitsnap>> => {
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

const likeTwitSnap = async( newLike: LikeSchema): Promise<SelectLike | null> => {
  return await db.likeTwitSnap(newLike);
}

const getTwitSnapLikes = async (getLike: string): Promise<Array<SelectLike>> => {
  return await db.getTwitSnapLikes(getLike);
}

const deleteTwitSnapLike = async(like: LikeSchema): Promise<void> => {
  return await db.deleteTwitSnapLike(like);
}

export default {
  getTwitSnaps,
  createTwitSnap,
  likeTwitSnap,
  getTwitSnap,
  getTwitSnapLikes,
  deleteTwitSnapLike
};
