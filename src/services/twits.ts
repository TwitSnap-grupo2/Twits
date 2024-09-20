import db from "../db/repositories/twits";
import { InsertTwitsnap, SelectTwitsnap } from "../db/schemas/twisnapSchema";

const getTwitSnaps = async (): Promise<Array<SelectTwitsnap>> => {
  return await db.getTwitSnaps();
};

const createTwitSnap = async (
  newTwitSnap: InsertTwitsnap
): Promise<SelectTwitsnap> => {
  return await db.createTwitSnap(newTwitSnap);
};

export default {
  getTwitSnaps,
  createTwitSnap,
};
