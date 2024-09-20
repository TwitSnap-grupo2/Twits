import { Router } from "express";
import twitSnapsService from "../services/twits";
import { z } from "zod";
import { InsertTwitsnap, SelectTwitsnap } from "../db/schemas/twisnapSchema";

const router = Router();

const newTwitSnapSchema = z.object({
  message: z.string().max(280),
  createdBy: z.string().uuid(),
  isPrivate: z.boolean().default(false),
});

router.get("/", async (_req, res, next) => {
  try {
    const twitSnaps = await twitSnapsService.getTwitSnaps();
    res.status(200).json(twitSnaps);
  } catch (err: unknown) {
    let errDescription = "";

    if (err instanceof Error) {
      errDescription += err.message;
    }
    next({ message: errDescription, name: "DatabaseError" });
  }
});

router.post("/", async (req, res, next) => {
  try {
    const result: InsertTwitsnap = newTwitSnapSchema.parse(req.body);

    const newTwitSnap: SelectTwitsnap | null =
      await twitSnapsService.createTwitSnap(result);

    if (!newTwitSnap) {
      next({
        name: "NotFound",
        message: "Error while trying to create twitsnap",
      });
    }

    res.status(201).json(newTwitSnap);
  } catch (err: unknown) {
    let errDescription = "";

    if (err instanceof Error) {
      errDescription += err.message;
    }
    next({ message: errDescription, name: "DatabaseError" });
  }
});

export default router;
