import { Router } from "express";
import twitSnapsService from "../services/twits";
import { z } from "zod";
import { InsertTwitsnap, SelectTwitsnap } from "../db/schemas/twisnapSchema";

const router = Router();

const newTwitSnapSchema = z.object({
  message: z.string().max(280),
  createdBy: z.string().uuid(),
});

router.get("/", async (_req, res) => {
  const twitSnaps = await twitSnapsService.getTwitSnaps();

  res.status(200).json(twitSnaps);
});

router.post("/", async (req, res, next) => {
  try {
    const result: InsertTwitsnap = newTwitSnapSchema.parse(req.body);

    const newTwitSnap: SelectTwitsnap | null =
      await twitSnapsService.createTwitSnap(result);

    if (!newTwitSnap) {
      next(new Error("Error while trying to create twitsnap"));
    }

    res.status(201).json(newTwitSnap);
  } catch (err: unknown) {
    next(err);
  }
});

export default router;
