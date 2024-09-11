import { Router } from "express";
import twitSnapsService from "../services/twits";
import { z } from "zod";
import logger from "../utils/logger";
import { TwitSnap } from "../utils/types";

const router = Router();
const newTwitSnapSchema = z.object({
  message: z.string().max(280),
  createdBy: z.string().uuid(),
});

router.get("/", (_req, res) => {
  const twitSnaps = twitSnapsService.getTwitSnaps();

  res.status(200).json({ data: twitSnaps });
});

router.post("/", (req, res) => {
  const result = newTwitSnapSchema.parse(req.body);
  logger.info("RESULT: ", result);
  const newTwitSnap: TwitSnap = twitSnapsService.createTwitSnap(result);

  res.status(201).json({ data: newTwitSnap });
});

export default router;
