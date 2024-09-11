import { NewTwitSnap, TwitSnap } from "../utils/types";
import db from "../repositories/twits";

const getTwitSnaps = (): Array<TwitSnap> => {
  return db.getTwitSnaps();
};

const createTwitSnap = (newTwitSnap: NewTwitSnap): TwitSnap => {
  return db.createTwitSnap(newTwitSnap);
};

export default {
  getTwitSnaps,
  createTwitSnap,
};
