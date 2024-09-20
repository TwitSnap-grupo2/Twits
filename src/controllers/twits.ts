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

router.post("/", async (req, res) => {
  const result: InsertTwitsnap = newTwitSnapSchema.parse(req.body);

  const newTwitSnap: SelectTwitsnap =
    await twitSnapsService.createTwitSnap(result);

  res.status(201).json(newTwitSnap);
});

export default router;
