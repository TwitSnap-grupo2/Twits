// import { NewTwitSnap, TwitSnap } from "../utils/types";
import db from "../db/repositories/twits";
import { SelectTwitsnap } from "../db/schemas/twisnapSchema";

const getTwitSnaps = async (): Promise<Array<SelectTwitsnap>> => {
  return await db.getTwitSnaps();
};

// const createTwitSnap = (newTwitSnap: NewTwitSnap): TwitSnap => {
//   return db.createTwitSnap(newTwitSnap);
// };

export default {
  getTwitSnaps,
  // createTwitSnap,
};
