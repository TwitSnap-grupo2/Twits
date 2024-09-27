import { Router } from "express";
import twitSnapsService from "../services/twits";
import { z } from "zod";
import { InsertTwitsnap, SelectTwitsnap } from "../db/schemas/twisnapSchema";
import { LikeSchema, SelectLike } from "../db/schemas/likeSchema";

const router = Router();

const newTwitSnapSchema = z.object({
  message: z.string().max(280),
  createdBy: z.string().uuid(),
  isPrivate: z.boolean().default(false),
});

const likeTwitSnapSchema = z.object({
  likedBy: z.string().uuid(),
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

router.get("/:id", async (req, res, next) => {
  try {
    const twitSnap = await twitSnapsService.getTwitSnap(req.params.id);

    if (!twitSnap) {
      next({
        name: "NotFound",
        message: "Twitsnap not found",
      });
    }

    res.status(200).json(twitSnap);
  } catch (err: unknown) {
    let errDescription = "";

    if (err instanceof Error) {
      errDescription += err.message;
    }
    next({ message: errDescription, name: "DatabaseError" });
  }
}
);

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

router.post("/:id/like", async (req, res, next) => {
  try {
    const result = likeTwitSnapSchema.parse(req.body);
    const twitsnapId = req.params.id;
    const schema: LikeSchema = { ...result, twitsnapId};
    const like: SelectLike | null = await twitSnapsService.likeTwitSnap(schema);
    

    if (!like) {
      next({
        name: "LikeError",
        message: "Error while trying to like twitsnap",
      });
    }

    res.status(201).json(like);
  } catch (err: unknown) {

    next(err);
  }
});

router.get("/:id/like", async (req, res, next) => {
  try {
    const twitsnapId = req.params.id;
    const twitSnapLikes = await twitSnapsService.getTwitSnapLikes(twitsnapId);
    

    res.status(200).json(twitSnapLikes);
  } catch (err: unknown) {
    let errDescription = "";

    if (err instanceof Error) {
      errDescription += err.message;
    }
    next({ message: errDescription, name: "DatabaseError" });
  }
}
);


router.delete("/:id/like", async (req, res, next) => {
  try {
    const result = likeTwitSnapSchema.parse(req.body);
    const twitsnapId = req.params.id;
    const schema: LikeSchema = { ...result, twitsnapId};
    const twitSnapLikes = await twitSnapsService.deleteTwitSnapLike(schema);
    res.status(204).send();
  } catch (err: unknown) {
    next(err)
  }
}
);


export default router;
