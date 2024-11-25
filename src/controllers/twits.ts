import { Router } from "express";
import twitSnapsService from "../services/twits";
import { InsertTwitsnap, SelectTwitsnap } from "../db/schemas/twisnapSchema";
import { LikeSchema, SelectLike } from "../db/schemas/likeSchema";
import { InsertSnapshare, SelectSnapshare } from "../db/schemas/snapshareSchema";
import { editTwitSnapSchema, feedSchema, hashtagSchema, likeTwitSnapSchema, mentionSchema, metricsHashtagSchema, metricsSchema, newTwitSnapSchema, postFavouriteSchema, searchTwitSchema, snapshareTwitSnapSchema, statsSchema } from "../db/schemas/validationSchemas";


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
    const twitSnaps = await twitSnapsService.getTwitSnapsByHashtag(result.name);
    res.status(200).json(twitSnaps);
  } catch (err: unknown) {
    next(err);
  }
}
);

router.get("/hashtag/search", async (req, res, next) => {
  try {
    const result = hashtagSchema.parse(req.query);
    const twitSnaps = await twitSnapsService.searchHashtags(result.name);
    res.status(200).json(twitSnaps);
  } catch (err: unknown) {
    next(err);
  }
}
);

router.get("/metrics", async (req, res, next) => {
  try {
    const result = metricsSchema.parse(req.query);
    const metrics = await twitSnapsService.getMetrics(result.range);
    res.status(200).json(metrics);
  } catch (err: unknown) {
    next(err)
  }
}
);

router.get("/metrics/hashtag", async (req, res, next) => {
  try {
    const result = metricsHashtagSchema.parse(req.query);
    const metrics = await twitSnapsService.getHashtagMetrics(result.name, result.range, result.limit);
    res.status(200).json(metrics);
  } catch (err: unknown) {
    next(err)
  }
}
);

router.get("/blockeds", async (_req, res, next) => {
  try {
    const twitSnaps = await twitSnapsService.getBlockedTwitSnaps();
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

router.patch("/:id/block", async (req, res, next) => {
  try {
    const body = await twitSnapsService.blockTwitSnap(req.params.id);
    res.status(200).send(body);
  } catch (err: unknown) {
    next(err);
  }
})

router.patch("/:id/unblock", async (req, res, next) => {
  try {
    const body = await twitSnapsService.unblockTwitSnap(req.params.id);
    res.status(200).send(body);
  } catch (err: unknown) {
    next(err);
  }
})


router.delete("/:id", async (req, res, next) => {
  try {
    await twitSnapsService.deleteTwitSnap(req.params.id);
    res.status(204).send();
  } catch (err: unknown) {
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

router.post("/:id/reply", async (req, res, next) => {
  try {
    const result = newTwitSnapSchema.parse(req.body);
    const twitsnapId = req.params.id;
    const newTwitSnapReply: InsertTwitsnap = { ...result, parentId: twitsnapId };
    const newTwitSnap: SelectTwitsnap | null = await twitSnapsService.createTwitSnap(newTwitSnapReply);
    res.status(201).json(newTwitSnap);
  } catch (err: unknown) {
    next(err);
  }
}
)

router.get("/:id/replies", async (req, res, next) => {
  try {
    const twitsnapId = req.params.id;
    const twitSnapReplies = await twitSnapsService.getTwitSnapReplies(twitsnapId);
    res.status(200).json(twitSnapReplies);
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
    res.status(201).json(like);
  } catch (err: any) {
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

router.post("/:id/favourite", async (req, res, next) => {
  try {
    const result = postFavouriteSchema.parse(req.body);
    const twitsnapId = req.params.id;
    const output = await twitSnapsService.postFavourite(twitsnapId, result.userId);
    res.status(201).json(output);
  } catch (err: unknown) {
    console.log(err)
    next(err)
  }
}
)

router.delete("/:id/favourite", async (req, res, next) => {
  try {
    const result = postFavouriteSchema.parse(req.query);
    const twitsnapId = req.params.id;
    await twitSnapsService.deleteFavourite(twitsnapId, result.userId);
    res.status(204).send();
  } catch (err: unknown) {
    next(err)
  }
}
)

router.get("/favourites/:id", async (req, res, next) => {
  try {
    const userId = req.params.id;
    const favourites = await twitSnapsService.getUserFavourites(userId);
    res.status(200).json(favourites);
  } catch (err: unknown) {
    next(err)
  }
}
)



router.post("/ping", async (req, res) => {
  res.status(200).json({ message: "pong" });
});



export default router;
