import { NewTwitSnap, TwitSnap } from "../utils/types";
import { v4 as uuidv4 } from "uuid";

let twitSnaps: Array<TwitSnap> = [];

const getTwitSnaps = (): Array<TwitSnap> => {
  return twitSnaps;
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
  getTwitSnaps,
  createTwitSnap,
  deleteTwitSnaps,
};
