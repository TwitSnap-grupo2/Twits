import { Router } from "express";
import twitSnapsService from "../services/twits";
import { InsertTwitsnap, SelectTwitsnap } from "../db/schemas/twisnapSchema";
import { LikeSchema, SelectLike } from "../db/schemas/likeSchema";
import { InsertSnapshare, SelectSnapshare } from "../db/schemas/snapshareSchema";
import { deleteResponseSchema, editTwitSnapSchema, feedSchema, hashtagSchema, likeTwitSnapSchema, mentionSchema, newTwitSnapSchema, searchTwitSchema, snapshareTwitSnapSchema, statsSchema } from "../db/schemas/validationSchemas";


const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const twitSnaps = await twitSnapsService.getTwitSnaps();
    res.status(200).json(twitSnaps);
  } catch (err: unknown) {
    next(err);
  }
});

router.get("/search", async (req, res, next) => {
  try {
    const result = searchTwitSchema.parse(req.query);
    const similarTwitSnaps = await twitSnapsService.getTwitSnapsBySimilarity(result.q);
    res.status(200).json(similarTwitSnaps);
  } catch (err: unknown) {
    next(err);
  }
})



router.get("/hashtag", async (req, res, next) => {
  try {
    const result = hashtagSchema.parse(req.query);
    const twitSnaps = await twitSnapsService.getTwitSnapsByHashtag(result.hashtag);
    res.status(200).json(twitSnaps);
  } catch (err: unknown) {
    next(err);
  }
}
);

router.get("/hashtag/search", async (req, res, next) => {
  try {
    const result = hashtagSchema.parse(req.query);
    const twitSnaps = await twitSnapsService.searchHashtags(result.hashtag);
    res.status(200).json(twitSnaps);
  } catch (err: unknown) {
    next(err);
  }
}
);

router.post("/feed", async (req, res, next) => {
  try {
    const result = feedSchema.parse(req.body);
    const date = new Date(result.timestamp_start);
    const feed = await twitSnapsService.getFeed(date, result.limit, result.followeds);
    res.status(200).json(feed);
  } catch (err: unknown) {
    next(err);
  }
}
);


router.get("/:id", async (req, res, next) => {
  try {
    const twitSnap = await twitSnapsService.getTwitSnapsById(req.params.id);

    if (!twitSnap) {
      next({
        name: "NotFound",
        message: "Twitsnap not found",
      });
    }

    res.status(200).json(twitSnap);
  } catch (err: unknown) {
    next(err);
  }
}
);

router.patch("/:id", async (req, res, next) => {
  try{
    const result = editTwitSnapSchema.parse(req.body);
    const twitSnap = await twitSnapsService.editTwitSnap(req.params.id, result);
    res.status(200).json(twitSnap);
  }
  catch (err: unknown) {
    next(err);
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
    next(err);
  }
});

router.post("/:id/response", async (req, res, next) => {
  try {
    const result = newTwitSnapSchema.parse(req.body);
    const twitsnapId = req.params.id;
    const newTwitSnap: SelectTwitsnap | null = await twitSnapsService.createResponse(twitsnapId, result);
    console.log(newTwitSnap);
    if (!newTwitSnap) {
      next({
        name: "NotFound",
        message: "Error while trying to create twitsnap",
      });
    }
    res.status(201).json(newTwitSnap);
  } catch (err: unknown) {
    console.log(err);
    next(err);
  }
}
)

router.get("/:id/responses", async (req, res, next) => {
  try {
    const twitsnapId = req.params.id;
    const twitSnapResponses = await twitSnapsService.getTwitSnapResponses(twitsnapId);
    res.status(200).json(twitSnapResponses);
  } catch (err: unknown) {
    next(err);
  }
}
);

router.delete("/:id/response", async (req, res, next) => {
  try {
    const result = deleteResponseSchema.parse(req.query);
    const twitsnapId = req.params.id;
    await twitSnapsService.deleteTwitSnapResponse(twitsnapId);
    res.status(204).send();
  } catch (err: unknown) {
    next(err);
  }
}
);


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
    next(err);
  }
}
);


router.delete("/:id/like", async (req, res, next) => {
  try {
    const result = likeTwitSnapSchema.parse(req.query);
    const twitsnapId = req.params.id;
    const schema: LikeSchema = { ...result, twitsnapId};
    await twitSnapsService.deleteTwitSnapLike(schema);
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
    const result = snapshareTwitSnapSchema.parse(req.query);
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
    const result = mentionSchema.parse(req.query);
    const twitsnapId = req.params.id;
    await twitSnapsService.deleteTwitSnapMention(twitsnapId, result.mentionedUser);
    res.status(204).send();
  } catch (err: unknown) {
    next(err)
  }
}
);

router.get("/stats/:id", async (req, res, next) => {
  try {
    const twitsnapId = req.params.id;
    const result = statsSchema.parse(req.query);
    const stats = await twitSnapsService.getUserStats(twitsnapId, result.limit);
    res.status(200).json(stats);
  } catch (err: unknown) {
    next(err)
  }
}) 

export default router;
