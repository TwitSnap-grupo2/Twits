import { NewTwitSnap, TwitSnap } from "../../utils/types";
import { v4 as uuidv4 } from "uuid";
import { SelectTwitsnap, twitSnap } from "../schemas/twisnapSchema";
import { db } from "../setup";
import { desc } from "drizzle-orm";

let twitSnaps: Array<TwitSnap> = [];

const getTwitSnapsOrderedByDate = async (): Promise<Array<SelectTwitsnap>> => {
  return await db.select().from(twitSnap).orderBy(desc(twitSnap.createdAt));
};

const createTwitSnap = (newTwitSnap: NewTwitSnap): TwitSnap => {
  const twitSnap: TwitSnap = {
    ...newTwitSnap,
    id: uuidv4(),
    createdAt: new Date(),
  };

  twitSnaps.push(twitSnap);
  return twitSnap;
};

const deleteTwitSnaps = (): void => {
  twitSnaps = [];
};

export default {
  getTwitSnaps: getTwitSnapsOrderedByDate,
  createTwitSnap,
  deleteTwitSnaps,
};
