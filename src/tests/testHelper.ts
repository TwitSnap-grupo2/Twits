import { NewTwitSnap } from "../utils/types";
import { v4 as uuid4 } from "uuid";

export const testTwitSnap: NewTwitSnap = {
  message: "Test twitsnap",
  createdBy: uuid4(),
};

// const resetTwitsSnapsDB = (): void => {
//   db.deleteTwitSnaps();
// };

// const createTwitSnap = (newTwitSnap: NewTwitSnap): TwitSnap => {
//   return twitSnapsService.createTwitSnap(newTwitSnap);
// };

// export default {
//   resetTwitsSnapsDB,
//   createTwitSnap,
// };
