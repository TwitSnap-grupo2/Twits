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

const getTwitSnapLike = async (getLike: LikeSchema): Promise<Array<SelectLike>> => {
  return await db.getTwitSnapLike(getLike);
}

export default {
  getTwitSnaps,
  createTwitSnap,
  likeTwitSnap,
  getTwitSnap,
  getTwitSnapLike
};
