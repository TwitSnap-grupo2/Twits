import { Router } from "express";
import twitSnapsService from "../services/twits";
import { z } from "zod";
import { InsertTwitsnap, SelectTwitsnap } from "../db/schemas/twisnapSchema";
import { LikeSchema, SelectLike } from "../db/schemas/likeSchema";
import { InsertSnapshare, SelectSnapshare } from "../db/schemas/snapshareSchema";

const router = Router();

const newTwitSnapSchema = z.object({
  message: z.string().max(280),
  createdBy: z.string().uuid(),
  isPrivate: z.boolean().default(false),
});

const likeTwitSnapSchema = z.object({
  likedBy: z.string().uuid(),
});

const snapshareTwitSnapSchema = z.object({
  sharedBy: z.string().uuid(),
});

const feedSchema = z.object({
  timestamp_start: z.string().datetime(),
  limit: z.coerce.number().int(),
})

const mentionSchema = z.object({
  mentionedUser: z.string().uuid(),
})

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

router.get("/feed", async (req, res, next) => {
  try {
    const result = feedSchema.parse(req.query);
    const date = new Date(result.timestamp_start);
    const feed = await twitSnapsService.getFeed(date, result.limit);
    res.status(200).json(feed);
  } catch (err: unknown) {
    next(err);
  }
}
);


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


router.post("/:id/share", async (req, res, next) => {
  try {
    const result = snapshareTwitSnapSchema.parse(req.body);
    const twitsnapId = req.params.id;
    const snapShare: InsertSnapshare = { ...result, twitsnapId};
    const newSnapShare: SelectSnapshare | null = await twitSnapsService.createSnapshare(snapShare);
    res.status(201).json(newSnapShare);
  } catch (err: unknown) {
    next(err)
  }
}
);



router.delete("/:id/share", async (req, res, next) => {
  try {
    const result = snapshareTwitSnapSchema.parse(req.body);
    const twitsnapId = req.params.id;
    const schema: InsertSnapshare = { ...result, twitsnapId};
    await twitSnapsService.deleteSnapshare(schema);
    res.status(204).send();
  } catch (err: unknown) {
    next(err)
  }
}
);

router.post("/:id/mention", async (req, res, next) => {
  try {
    const result = mentionSchema.parse(req.body);
    const twitsnapId = req.params.id;
    const body = await twitSnapsService.mentionUser(twitsnapId, result.mentionedUser);
    res.status(201).send(body);
  } catch (err: unknown) {
    next(err)
  }
}
);

router.get("/:id/mention", async (req, res, next) => {
  try {
    const twitsnapId = req.params.id;
    const mentions = await twitSnapsService.getTwitSnapMentions(twitsnapId);
    res.status(200).json(mentions);
  } catch (err: unknown) {
    next(err)
  }
}
);

router.delete("/:id/mention", async (req, res, next) => {
  try {
    const result = mentionSchema.parse(req.body);
    const twitsnapId = req.params.id;
    await twitSnapsService.deleteTwitSnapMention(twitsnapId, result.mentionedUser);
    res.status(204).send();
  } catch (err: unknown) {
    next(err)
  }
}
);


export default router;
