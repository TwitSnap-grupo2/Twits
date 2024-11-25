import { beforeEach, describe, expect, test } from "@jest/globals";
import supertest from "supertest";
import app from "../app";
import { testTwitSnap } from "./testHelper";
import twitSnapRepository from "../db/repositories/twits";
import twitSnapService from "../services/twits";
import { InsertTwitsnap, SelectTwitsnap } from "../db/schemas/twisnapSchema";
import { response } from "express";

const api = supertest(app);

describe("twitsnaps", () => {
  beforeEach(async () => {
    await twitSnapRepository.deleteTwitsnaps();
  });

  test("can be obtained when there are no twitsnaps", async () => {
    const Reply = await api.get("/api/twits").expect(200);
    expect(Reply.body).toHaveLength(0);
  });

  test("can be created", async () => {
    const Reply = await api
      .post("/api/twits")
      .send(testTwitSnap)
      .expect(201);

    const data: InsertTwitsnap = Reply.body;

    expect(data.id).toBeDefined();
    expect(data.createdAt).toBeDefined();
    expect(data.message).toBe(testTwitSnap.message);
    expect(data.createdBy).toBe(testTwitSnap.createdBy);
  });

  test("can be obtained when there is a twitsnap", async () => {
    const newTwitSnap: SelectTwitsnap | null =
      await twitSnapService.createTwitSnap(testTwitSnap);

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    const Reply = await api.get("/api/twits").expect(200);

    const data: Array<SelectTwitsnap> = Reply.body;

    expect(data).toHaveLength(1);

    expect(data[0].id).toBe(newTwitSnap.id);
    expect(data[0].message).toBe(newTwitSnap.message);
    expect(data[0].createdBy).toBe(newTwitSnap.createdBy);
    expect(data[0].createdAt).toBe(newTwitSnap.createdAt.toISOString());
  });

  test("can be obtained by user id", async () => {
    const newTwitSnap: SelectTwitsnap | null =
      await twitSnapService.createTwitSnap(testTwitSnap);

    const otherTwitSnap: InsertTwitsnap = {
      message: "This is another twitsnap",
      createdBy: "12345678-1234-1234-1234-123456789012",
    };

    await twitSnapService.createTwitSnap(otherTwitSnap);

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    await twitSnapRepository.likeTwitSnap({
      likedBy: "12345678-1234-1234-1234-123456789012",
      twitsnapId: newTwitSnap.id,
    });

    await twitSnapRepository.createSnapshare({
      twitsnapId: newTwitSnap.id,
      sharedBy: "12345678-1234-1234-1234-123456789012",
    });

    await twitSnapRepository.createReply(newTwitSnap.id, {
      message: "This is a Reply",
      createdBy: "12345678-1234-1234-1234-123456789012",
    });

    const response = await api
      .get("/api/twits/" + newTwitSnap.createdBy)
      .expect(200);

    const data = response.body;


    expect(data).toHaveLength(1);

    expect(data[0].id).toBe(newTwitSnap.id);
    expect(data[0].message).toBe(newTwitSnap.message);
    expect(data[0].createdBy).toBe(newTwitSnap.createdBy);
    expect(data[0].createdAt).toBe(newTwitSnap.createdAt.toISOString());
    expect(data[0].likesCount).toBe(1);
    expect(data[0].sharesCount).toBe(1);
    expect(data[0].repliesCount).toBe(1);
  }
  );

  test("can be searched by text", async () => {
    const newTwitSnap: SelectTwitsnap | null =
      await twitSnapService.createTwitSnap(testTwitSnap);

    const otherTwitSnap: InsertTwitsnap = {
      message: "This is another twitsnap",
      createdBy: "12345678-1234-1234-1234-123456789012",
    };

    await twitSnapService.createTwitSnap(otherTwitSnap);

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    const Reply = await api
      .get("/api/twits/search?q=twitsnap")
      .expect(200);

    const data: Array<SelectTwitsnap> = Reply.body;

    expect(data).toHaveLength(2);

    expect(data[0].message).toBe(otherTwitSnap.message);
    expect(data[1].message).toBe(testTwitSnap.message);

  })

  test("can be edited", async () => {
    const newTwitSnap: SelectTwitsnap | null =
      await twitSnapService.createTwitSnap(testTwitSnap);

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    const Reply = await api
      .patch("/api/twits/" + newTwitSnap.id)
      .send({ message: "This is an edited twitsnap" })
      .expect(200);

    const data: InsertTwitsnap = Reply.body;

    expect(data.id).toBe(newTwitSnap.id);
    expect(data.message).toBe("This is an edited twitsnap");
    expect(data.createdBy).toBe(newTwitSnap.createdBy);
  }
  );

  test("can be deleted", async () => {
    const newTwitSnap: SelectTwitsnap | null =
      await twitSnapService.createTwitSnap(testTwitSnap);

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    await api.delete("/api/twits/" + newTwitSnap.id).expect(204);
  }
  );
});

describe("twitsnap likes", () => {
  beforeEach(async () => {
    await twitSnapRepository.deleteAllTwitSnapLikes();
  });

  test("twitsnap can be liked", async () => {
    const newTwitSnap: SelectTwitsnap | null =
    await twitSnapService.createTwitSnap(testTwitSnap);

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    const Reply = await api
      .post("/api/twits/" + newTwitSnap.id + "/like")
      .send({ likedBy: testTwitSnap.createdBy })
      .expect(201);

    const data = Reply.body;

    expect(data.likedBy).toBe(testTwitSnap.createdBy);
    expect(data.twitsnapId).toBe(newTwitSnap.id);
  });

  test("twitsnap can be liked only once", async () => {
    const newTwitSnap: SelectTwitsnap | null =
    await twitSnapService.createTwitSnap(testTwitSnap);

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    const res = await api
      .post("/api/twits/" + newTwitSnap.id + "/like")
      .send({ likedBy: testTwitSnap.createdBy })
      .expect(201);

    await api
      .post("/api/twits/" + newTwitSnap.id + "/like")
      .send({ likedBy: testTwitSnap.createdBy })
      .expect(400);
  });

  test("twitsnap like can be removed", async () => {
    const newTwitSnap: SelectTwitsnap | null =
    await twitSnapService.createTwitSnap(testTwitSnap);

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    await api
      .post("/api/twits/" + newTwitSnap.id + "/like")
      .send({ likedBy: testTwitSnap.createdBy })
      .expect(201);

    await api
      .delete("/api/twits/" + newTwitSnap.id + "/like?likedBy=" + testTwitSnap.createdBy)
      .expect(204);
  }
  );

  test("twitsnap like can be removed only once", async () => {
    const newTwitSnap: SelectTwitsnap | null =
    await twitSnapService.createTwitSnap(testTwitSnap);

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    await api
      .post("/api/twits/" + newTwitSnap.id + "/like")
      .send({ likedBy: testTwitSnap.createdBy })
      .expect(201);

    await api
      .delete("/api/twits/" + newTwitSnap.id + "/like?likedBy=" + testTwitSnap.createdBy)
      .expect(204);

    await api
      .delete("/api/twits/" + newTwitSnap.id + "/like?likedBy=" + testTwitSnap.createdBy)
      .expect(404);

  })
});

  test("all twitsnap likes can be obtained", async () => {
    const newTwitSnap: SelectTwitsnap | null =
    await twitSnapService.createTwitSnap(testTwitSnap);

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    await api
      .post("/api/twits/" + newTwitSnap.id + "/like")
      .send({ likedBy: testTwitSnap.createdBy })
      .expect(201);

    await api
    .post("/api/twits/" + newTwitSnap.id + "/like")
    .send({ likedBy: "12345678-1234-1234-1234-123456789012" })
    .expect(201);

    const Reply = await api
      .get("/api/twits/" + newTwitSnap.id + "/like")
      .expect(200);

    const data = Reply.body;

    expect(data).toHaveLength(2);
  }
);

describe("snapshares", () => {
  beforeEach(async () => {
    await twitSnapRepository.deleteSnapshares();
  });

  test("can be created", async () => {
    const newTwitSnap: SelectTwitsnap | null =
    await twitSnapService.createTwitSnap(testTwitSnap);

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    const Reply = await api
      .post("/api/twits/" + newTwitSnap.id + "/share")
      .send({ sharedBy: testTwitSnap.createdBy })
      .expect(201);

    const data = Reply.body;

    expect(data.twitsnapId).toBe(newTwitSnap.id);
    expect(data.sharedBy).toBe(testTwitSnap.createdBy);
    expect(data.sharedAt).toBeDefined();
  });

  test("cannot be created if twitsnap does not exist", async () => {
    await api
      .post("/api/twits/12345678-1234-1234-1234-123456789012/share")
      .send({ sharedBy: testTwitSnap.createdBy })
      .expect(404);
  }
  );

  test("can be removed", async () => {
    const newTwitSnap: SelectTwitsnap | null =
    await twitSnapService.createTwitSnap(testTwitSnap);

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    await api
      .post("/api/twits/" + newTwitSnap.id + "/share")
      .send({ sharedBy: testTwitSnap.createdBy })
      .expect(201);

    await api
      .delete("/api/twits/" + newTwitSnap.id + "/share?sharedBy=" + testTwitSnap.createdBy)
      .expect(204);
  }
  );
});

describe("feed", () => {
  beforeEach(async () => {
    await twitSnapRepository.deleteTwitsnaps();
    await twitSnapRepository.deleteSnapshares();
  });

  test("can be obtained when there are no twitsnaps", async () => {
    const body = {
      timestamp_start: new Date().toISOString(),
      limit: 10,
      followeds: [],
    }
    const Reply = await api
      .post("/api/twits/feed")
      .send(body)
      .expect(200);
    expect(Reply.body).toHaveLength(0);
  }
  );

  test("can be obtained when there are twitsnaps by followeds", async () => {
    const newTwitSnapNonFollowed: SelectTwitsnap | null =
    await twitSnapService.createTwitSnap(testTwitSnap);

    if (!newTwitSnapNonFollowed) {
      throw new Error("Error creating twitsnap");
    }

    const newTwitSnapFollowed: SelectTwitsnap | null = await twitSnapService.createTwitSnap({
      message: "This is another twitsnap",
      createdBy: "12345678-1234-1234-1234-123456789012",
    });

    if (!newTwitSnapFollowed) {
      throw new Error("Error creating twitsnap 2");
    }
    const date_actual = new Date()
    date_actual.setMinutes(date_actual.getMinutes() + 1)
    const body = {
      timestamp_start: date_actual.toISOString(),
      limit: 10,
      followeds: ["12345678-1234-1234-1234-123456789012"],
    }
    const Reply = await api
      .post("/api/twits/feed")
      .send(body)
      .expect(200);


    const data = Reply.body;

    expect(data).toHaveLength(1);

    expect(data[0].id).toBe(newTwitSnapFollowed.id);
    expect(data[0].message).toBe(newTwitSnapFollowed.message);
    expect(data[0].createdBy).toBe(newTwitSnapFollowed.createdBy);
    expect(data[0].createdAt).toBe(newTwitSnapFollowed.createdAt.toISOString());
  })

  test("can be obtained when there are shared twitsnaps", async () => {
    const newTwitSnap: SelectTwitsnap | null =
    await twitSnapService.createTwitSnap(testTwitSnap);

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    await twitSnapService.createTwitSnap({
      message: "This is another twitsnap",
      createdBy: "12345678-1234-1234-1234-123456789012",
    });

    await twitSnapService.createSnapshare({
      twitsnapId: newTwitSnap.id,
      sharedBy: "12345678-1234-1234-1234-123456789012",
    });

    const date_actual = new Date()
    date_actual.setMinutes(date_actual.getMinutes() + 1)
    const body = {
      timestamp_start: date_actual.toISOString(),
      limit: 10,
      followeds: ["12345678-1234-1234-1234-123456789012"],
    }

    const Reply = await api
      .post("/api/twits/feed")
      .send(body)
      .expect(200);

    const data = Reply.body;

    expect(data).toHaveLength(2);

    expect(data[0].id).toBe(newTwitSnap.id);
    expect(data[0].message).toBe(newTwitSnap.message);
    expect(data[0].createdBy).toBe(newTwitSnap.createdBy);
    expect(data[0].sharedBy).toBe("12345678-1234-1234-1234-123456789012");
  }
  ); 

  test("can be obtained setting a timestamp and limit", async () => {
    await twitSnapService.createTwitSnap(testTwitSnap);

    const second_twitsnap: SelectTwitsnap | null= await twitSnapService.createTwitSnap({
      message: "This is another twitsnap",
      createdBy: "12345678-1234-1234-1234-123456789012",
    });

    if (!second_twitsnap) {
      throw new Error("Error creating second twitsnap");
    }

    const third_twitsnap: SelectTwitsnap | null = await twitSnapService.createTwitSnap({
      message: "This is a third twitsnap",
      createdBy: "12345678-1234-1234-1234-123456789012",
    });

    if (!third_twitsnap) {
      throw new Error("Error creating third twitsnap");
    }

    const body = {
      timestamp_start: third_twitsnap.createdAt.toISOString(),
      limit: 1,
      followeds: ["12345678-1234-1234-1234-123456789012"],
    }

    const Reply = await api
      .post("/api/twits/feed")
      .send(body)
      .expect(200);

    const data = Reply.body;

    expect(data).toHaveLength(1);

    expect(data[0].id).toBe(second_twitsnap.id);
    expect(data[0].message).toBe(second_twitsnap.message);
    expect(data[0].createdBy).toBe(second_twitsnap.createdBy);
    expect(data[0].createdAt).toBe(second_twitsnap.createdAt.toISOString());
  }
  );

  test("can be obtained with likes, shares count, and replies", async () => {
    const newTwitSnap: SelectTwitsnap | null = await twitSnapService.createTwitSnap(testTwitSnap);

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    await twitSnapService.createTwitSnap({
      message: "This is another twitsnap",
      createdBy: "12345678-1234-1234-1234-123456789012",
    });
   

    await twitSnapService.createSnapshare({
      twitsnapId: newTwitSnap.id,
      sharedBy: "12345678-1234-1234-1234-123456789012",
    });

    await twitSnapService.likeTwitSnap({
      likedBy: "12345678-1234-1234-1234-123456789012",
      twitsnapId: newTwitSnap.id,
    });

    await twitSnapService.createReply(newTwitSnap.id, {
      message: "This is a Reply",
      createdBy: "12345678-1234-1234-1234-123456789012",
    });

    const body = {
      timestamp_start: new Date().toISOString(),
      limit: 10,
      followeds: ["12345678-1234-1234-1234-123456789012", newTwitSnap.createdBy],
    }
    const response = await api
      .post("/api/twits/feed")
      .send(body)
      .expect(200);

    const data = response.body;

    expect(data).toHaveLength(3);

    expect(data[2].id).toBe(newTwitSnap.id);
    expect(data[2].message).toBe(newTwitSnap.message);
    expect(data[2].createdBy).toBe(newTwitSnap.createdBy);
    expect(data[2].likesCount).toBe(1);
    expect(data[2].sharesCount).toBe(1);
    expect(data[2].repliesCount).toBe(1);
  }, 10000);
});

describe("mentions", () => {
  beforeEach(async () => {
    await twitSnapRepository.deleteTwitsnaps()
    await twitSnapRepository.deleteMentions();
  }
  );

  test("can be created", async () => {
    const newTwitSnap: SelectTwitsnap | null = await twitSnapService.createTwitSnap(testTwitSnap);

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    await api
      .post("/api/twits/" + newTwitSnap.id + "/mention")
      .send({ mentionedUser: "12345678-1234-1234-1234-123456789012" })
      .expect(201);
    
    const res = await twitSnapRepository.getTwitSnapMentions(newTwitSnap.id);
    expect(res).toHaveLength(1);

    expect(res[0].twitsnapId).toBe(newTwitSnap.id);
    expect(res[0].userMentionedId).toBe("12345678-1234-1234-1234-123456789012");
  }
  );

  test("cannot be created if twitsnap does not exist", async () => {
    await api
      .post("/api/twits/12345678-1234-1234-1234-123456789012/mention")
      .send({ mentionedUser: "12345678-1234-1234-1234-123456789012" })
      .expect(404);
  }
  );

  test("can be removed", async () => {
    const newTwitSnap: SelectTwitsnap | null = await twitSnapService.createTwitSnap(testTwitSnap);

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    await api
      .post("/api/twits/" + newTwitSnap.id + "/mention")
      .send({ mentionedUser: "12345678-1234-1234-1234-123456789012" })
      .expect(201);

    await api
      .delete("/api/twits/" + newTwitSnap.id + "/mention?mentionedUser=12345678-1234-1234-1234-123456789012")
      .expect(204);
  }
);
})

describe("hashtags", () => {
  beforeEach(async () => {
    await twitSnapRepository.deleteTwitsnaps();
    await twitSnapRepository.deleteAllHashTags();
  });

  test("are added after creating a twitsnap", async () => {
    const newTwitSnap: SelectTwitsnap | null = await twitSnapService.createTwitSnap({
      message: "This is a #twitsnap",
      createdBy: "12345678-1234-1234-1234-123456789012",
    });

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    const res = await twitSnapRepository.getTwitSnapHashtags(newTwitSnap.id);

    expect(res).toHaveLength(1);
    expect(res[0].name).toBe("twitsnap");

})

  test("twitsnaps can be obtained by hashtag", async () => {
    const newTwitSnap: SelectTwitsnap | null = await twitSnapService.createTwitSnap({
      message: "This is a #twitsnap",
      createdBy: "12345678-1234-1234-1234-123456789012",
    });

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    await twitSnapService.createSnapshare({
      twitsnapId: newTwitSnap.id,
      sharedBy: "12345678-1234-1234-1234-123456789012",
    });

    await twitSnapService.likeTwitSnap({
      likedBy: "12345678-1234-1234-1234-123456789012",
      twitsnapId: newTwitSnap.id,
    });

    await twitSnapService.createReply(newTwitSnap.id, {
      message: "This is a Reply",
      createdBy: "12345678-1234-1234-1234-123456789012",
    });

   

    const res = await api.get("/api/twits/hashtag?name=twitsnap").expect(200);

    const data = res.body;


    expect(data).toHaveLength(1);
    expect(data[0].id).toBe(newTwitSnap.id);
    expect(data[0].message).toBe(newTwitSnap.message);
    expect(data[0].createdBy).toBe(newTwitSnap.createdBy);
    expect(data[0].likesCount).toBe(1);
    expect(data[0].sharesCount).toBe(1);
    expect(data[0].repliesCount).toBe(1);
});

  test("hashtags can be searched", async () => {
    await twitSnapService.createTwitSnap({
      message: "This is a #twitsnap",
      createdBy: "12345678-1234-1234-1234-123456789012",
    });

    await twitSnapService.createTwitSnap({
      message: "This is a #anothertwitsnap",
      createdBy: "12345678-1234-1234-1234-123456789012",
    });



    const res = await twitSnapService.searchHashtags("twitsnap");

    expect(res).toHaveLength(2);
    expect(res[0]).toBe("twitsnap");
    expect(res[1]).toBe("anothertwitsnap");
  }
);

  test("can be deleted or added when editing a twitsnap", async () => {
    const newTwitSnap: SelectTwitsnap | null = await twitSnapService.createTwitSnap({
      message: "This is a #twitsnap",
      createdBy: "12345678-1234-1234-1234-123456789012",
    });

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    const res = await twitSnapRepository.getTwitSnapHashtags(newTwitSnap.id);

    expect(res).toHaveLength(1);
    expect(res[0].name).toBe("twitsnap");

    await api.patch("/api/twits/" + newTwitSnap.id).send({ message: "This is a #anothertwitsnap" }).expect(200);

    const res2 = await twitSnapRepository.getTwitSnapHashtags(newTwitSnap.id);

    expect(res2).toHaveLength(1);
    expect(res2[0].name).toBe("anothertwitsnap");
    
  }
);

});

describe("stats", () => {
  beforeEach(async () => {
    await twitSnapRepository.deleteTwitsnaps();
  }
);

  test("can be obtained filtered", async () => {
    const author = "12345678-1234-1234-1234-123456789012";
    const twit1 = await twitSnapService.createTwitSnap({
      message: "This is a #twitsnap",
      createdBy: author,
    });

    const twit2 = await twitSnapService.createTwitSnap({
      message: "This is a #anothertwitsnap",
      createdBy: author,
    });



    if (!twit1 || !twit2) {
      throw new Error("Error creating twitsnap");
    }

    await twitSnapService.createSnapshare({
      twitsnapId: twit1.id,
      sharedBy: author,
    });

    await twitSnapService.likeTwitSnap({
      likedBy: author,
      twitsnapId: twit1.id,
    });

    await twitSnapService.likeTwitSnap({
      likedBy: author,
      twitsnapId: twit2.id,
    });

    await twitSnapService.createReply(twit1.id, {
      message: "This is a Reply",
      createdBy: "12345678-1234-1234-1934-123456789012",
    });

    await twitSnapService.createReply(twit1.id, {
      message: "This is another Reply",
      createdBy: "12345678-1234-1234-1734-123456789012",
    });

    await twitSnapService.createReply(twit1.id, {
      message: "This is another Reply",
      createdBy: author,
    });

    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 365);

    await twitSnapRepository.addRawTwitSnapForTesting({
      id: "12345678-1234-1234-1234-123456789013",
      message: "This is a #thirdtwitsnap",
      createdBy: "12345678-1234-1234-1234-123456789012",
      createdAt: oldDate,
    });


    const Reply = await api.get("/api/twits/stats/12345678-1234-1234-1234-123456789012?limit=7").expect(200);
    const data = Reply.body;

    expect(data.twitsTotal).toBe(3);
    expect(data.sharesTotal).toBe(1);
    expect(data.likesTotal).toBe(2);
    expect(data.repliesTotal).toBe(3);

  }, 6000);

  test("can be obtained without filter", async () => {
    const twit1 = await twitSnapService.createTwitSnap({
      message: "This is a #twitsnap",
      createdBy: "12345678-1234-1234-1234-123456789012",
    });

    const twit2 = await twitSnapService.createTwitSnap({
      message: "This is a #anothertwitsnap",
      createdBy: "12345678-1234-1234-1234-123456789012",
    });



    if (!twit1 || !twit2) {
      throw new Error("Error creating twitsnap");
    }

    await twitSnapService.createSnapshare({
      twitsnapId: twit1.id,
      sharedBy: "12345678-1234-1234-1234-123456789012",
    });

    await twitSnapService.likeTwitSnap({
      likedBy: "12345678-1234-1234-1234-123456789012",
      twitsnapId: twit1.id,
    });

    await twitSnapService.likeTwitSnap({
      likedBy: "12345678-1234-1234-1234-123456789012",
      twitsnapId: twit2.id,
    });

    await twitSnapService.createReply(twit1.id, {
      message: "This is a Reply",
      createdBy: "12345608-1234-1234-1234-123456789012",
    });

    await twitSnapService.createReply(twit1.id, {
      message: "This is another Reply",
      createdBy: "52345678-1234-1234-1234-123456789012",
    });

    await twitSnapService.createReply(twit1.id, {
      message: "This is another Reply",
      createdBy: "12345678-1234-1234-1234-123456789012",
    });

    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 365);

    await twitSnapRepository.addRawTwitSnapForTesting({
      id: "12345678-1234-1234-1234-123456789013",
      message: "This is a #thirdtwitsnap",
      createdBy: "12345678-1234-1234-1234-123456789012",
      createdAt: oldDate,
    });


    const Reply = await api.get("/api/twits/stats/12345678-1234-1234-1234-123456789012").expect(200);
    const data = Reply.body;

    expect(data.twitsTotal).toBe(4);
    expect(data.sharesTotal).toBe(1);
    expect(data.likesTotal).toBe(2);
    expect(data.repliesTotal).toBe(3);

  }, 6000);
})

describe("twitsnaps replies", () => {
  beforeEach(async () => {
    await twitSnapRepository.deleteTwitsnaps();
  })

  test("can be created", async () => {
    const newTwitSnap: SelectTwitsnap | null = await twitSnapService.createTwitSnap(testTwitSnap);

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    const Reply = await api
      .post("/api/twits/" + newTwitSnap.id + "/reply")
      .send({ message: "This is a Reply", createdBy: "12345678-1234-1234-1234-123456789012" })
      .expect(201);

    const data = Reply.body;

    expect(data.parentId).toBe(newTwitSnap.id);
    expect(data.message).toBe("This is a Reply");
    expect(data.createdBy).toBe("12345678-1234-1234-1234-123456789012");
  }
  );

  test("cannot be created if twitsnap does not exist", async () => {
    await api
      .post("/api/twits/12345678-1234-1234-1234-123456789012/reply")
      .send({ message: "This is a Reply", createdBy: "12345678-1234-1234-1234-123456789012" })
      .expect(404);
  }
  );

  test("can be obtained by twitsnap id", async () => {
    const newTwitSnap: SelectTwitsnap | null = await twitSnapService.createTwitSnap(testTwitSnap);

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    const response1 = await twitSnapService.createReply(newTwitSnap.id, {
      message: "This is a Reply",
      createdBy: "12345678-1234-1234-1234-123456789012",
    });

    if (!response1) {
      throw new Error("Error creating reply");
    }

    await twitSnapRepository.likeTwitSnap(
      {
        likedBy: "12345678-1234-1234-1234-123456789012",
        twitsnapId: response1.id,
      }
    )
    

    const response2 = await twitSnapService.createReply(newTwitSnap.id, {
      message: "This is another Reply",
      createdBy: "12345678-1234-4234-1234-123456789012"
    });

    if (!response2) {
      throw new Error("Error creating reply");
    }

    await twitSnapRepository.likeTwitSnap(
      {
        likedBy: "12345678-1234-4234-1234-123456789012",
        twitsnapId: response2.id,
      }
    )

    const Reply = await api
      .get("/api/twits/" + newTwitSnap.id + "/replies")
      .expect(200);

    const data = Reply.body;

    expect(data).toHaveLength(2);

    expect(data[0].message).toBe("This is another Reply");
    expect(data[0].likesCount).toBe(1);
    expect(data[1].message).toBe("This is a Reply");
    expect(data[1].likesCount).toBe(1);
  }
  
);

  test("can be responded to", async () => {
    const newTwitSnap: SelectTwitsnap | null = await twitSnapService.createTwitSnap(testTwitSnap);

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    const Reply = await api
      .post("/api/twits/" + newTwitSnap.id + "/Reply")
      .send({ message: "This is a Reply", createdBy: "12345678-1234-1234-1234-123456789012" })
      .expect(201);

    const data = Reply.body;

    expect(data.parentId).toBe(newTwitSnap.id);
    expect(data.message).toBe("This is a Reply");
    expect(data.createdBy).toBe("12345678-1234-1234-1234-123456789012");

    const Reply2 = await api.post("/api/twits/" + data.id + "/Reply").send({ message: "This is a Reply to a Reply", createdBy: "12345678-1234-1234-1234-123456789012" }).expect(201);

    const data2 = Reply2.body;

    expect(data2.parentId).toBe(data.id);
    expect(data2.message).toBe("This is a Reply to a Reply");
  })

  test("can be deleted", async () => {
    const newTwitSnap: SelectTwitsnap | null = await twitSnapService.createTwitSnap(testTwitSnap);

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    const response = await api
      .post("/api/twits/" + newTwitSnap.id + "/reply")
      .send({ message: "This is a Reply", createdBy: "12345678-1234-1234-1234-123456789012" })
      .expect(201);

    const data = response.body;

    await api.delete("/api/twits/" + data.id).expect(204);

    const res = await twitSnapRepository.getTwitSnapsByTwitId(data.id);

    expect(res.message).toBeNull();
  }
  );

  test("can be edited", async () => {
    const newTwitSnap: SelectTwitsnap | null = await twitSnapService.createTwitSnap(testTwitSnap);

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    const Reply = await api
      .post("/api/twits/" + newTwitSnap.id + "/reply")
      .send({ message: "This is a Reply", createdBy: "12345678-1234-1234-1234-123456789012" })
      .expect(201);

    const data = Reply.body;

    const Reply2 = await api
      .patch("/api/twits/" + data.id)
      .send({ message: "This is an edited Reply" })
      .expect(200);

    const data2 = Reply2.body;

    expect(data2.id).toBe(data.id);
    expect(data2.message).toBe("This is an edited Reply");
    expect(data2.createdBy).toBe(data.createdBy);
  }
  );

  test("can be liked", async() => {
    const newTwitSnap: SelectTwitsnap | null = await twitSnapService.createTwitSnap(testTwitSnap);

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    const reply = await api
      .post("/api/twits/" + newTwitSnap.id + "/reply")
      .send({ message: "This is a Reply", createdBy: "12345678-1234-1234-1234-123456789012" })
      .expect(201);

    const data =  reply.body;

    await api
      .post("/api/twits/" + data.id + "/like")
      .send({ likedBy: "12345678-1234-1234-1234-123456789012" })
      .expect(201);
  })

  test("can be shared", async () => {
    const newTwitSnap: SelectTwitsnap | null = await twitSnapService.createTwitSnap(testTwitSnap);

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    const reply = await api
      .post("/api/twits/" + newTwitSnap.id + "/reply")
      .send({ message: "This is a Reply", createdBy: "12345678-1234-1234-1234-123456789012" })
      .expect(201);

    const data =  reply.body;

    await api
      .post("/api/twits/" + data.id + "/share")
      .send({ sharedBy: "12345678-1234-1234-1234-123456789012" })
      .expect(201);

  })

  test("can have mentions", async () => {
    const newTwitSnap: SelectTwitsnap | null = await twitSnapService.createTwitSnap(testTwitSnap);

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    const reply = await api
      .post("/api/twits/" + newTwitSnap.id + "/reply")
      .send({ message: "This is a Reply", createdBy: "12345678-1234-1234-1234-123456789012" })
      .expect(201);

    const data =  reply.body;

    await api
      .post("/api/twits/" + data.id + "/mention")
      .send({ mentionedUser: "12345678-1234-1234-1234-123456789012" })
      .expect(201);
  }
  );

  test("can have hashtags", async () => {
    const newTwitSnap: SelectTwitsnap | null = await twitSnapService.createTwitSnap(testTwitSnap);

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    const reply = await api
      .post("/api/twits/" + newTwitSnap.id + "/reply")
      .send({ message: "This is a #reply", createdBy: "12345678-1234-1234-1234-123456789012" })
      .expect(201);

    const data =  reply.body;

    const hashtags = await twitSnapRepository.getTwitSnapHashtags(data.id);

    expect(hashtags).toHaveLength(1);

    expect(hashtags[0].name).toBe("reply");

  }
  );
});

// describe("content metrics", () => {
//   beforeEach(async () => {
//     await twitSnapRepository.deleteTwitsnaps();
//     await twitSnapRepository.deleteAllHashTags()
//   })

//   test("can be obtained with total and frequency", async () => {
//     const monthAgoDate = new Date();
//     monthAgoDate.setMonth(monthAgoDate.getMonth() - 1);
//     const twit1 = await twitSnapRepository.addRawTwitSnapForTesting({
//       message: "This is a #twitsnap",
//       createdBy: "12345678-1234-1234-1234-123456789012",
//       createdAt: monthAgoDate,
//     });

//     const twit2 = await twitSnapRepository.addRawTwitSnapForTesting({
//       message: "This is a #twitsnap",
//       createdBy: "12345678-1234-1234-1234-123456789012",
//       createdAt: monthAgoDate,
//     });
//     const twoMonthsAgoDate = new Date();
//     twoMonthsAgoDate.setMonth(twoMonthsAgoDate.getMonth() - 2);
//     const twit3 = await twitSnapRepository.addRawTwitSnapForTesting({
//       message: "This is a #twitsnap",
//       createdBy: "12345678-1234-1234-1234-123456789012",
//       createdAt: twoMonthsAgoDate,
//     });
    
//     const twit4 = await twitSnapRepository.addRawTwitSnapForTesting({
//       message: "This is a #twitsnap",
//       createdBy: "12345678-1234-1234-1234-123456789012",
//       createdAt: twoMonthsAgoDate,
//     });

//     if(!twit1 || !twit2 || !twit3 || !twit4) {
//       throw new Error("Error creating twitsnaps");
//     }

//     const res = await api.get('/api/twits/metrics?range=day&limit=200').expect(200);

//     const data = res.body;

//     expect(data.total).toBe(4);

//     expect(data.frequency).toHaveLength(2);
//     })


//     test("hashtag metrics can be obtained", async () => {
//       const monthAgoDate = new Date();
//       monthAgoDate.setMonth(monthAgoDate.getMonth() - 1);
//       const twit1 = await api.post("/api/twits").send({
//         message: "This is a #twitsnap",
//         createdBy: "12345678-1234-1234-1234-123456789012",
//       }).expect(201);
  
//       const twit2 =  await api.post("/api/twits").send({
//         message: "This is a #twitsnap",
//         createdBy: "12345678-1234-1234-1234-123456789012",
//       }).expect(201);
  
//       const res = await api.get('/api/twits/metrics/hashtag?name=twitsnap&range=month&limit=200').expect(200);
  
//       const data = res.body;
  
//       expect(data.total).toBe(2);
  
//       expect(data.frequency).toHaveLength(1);
//       }
//     )
// })


describe("twitsnaps block", () => {
  beforeEach(async () => {
    await twitSnapRepository.deleteTwitsnaps();
  })

  test("can be blocked", async () => {
    const newTwitSnap: SelectTwitsnap | null = await twitSnapService.createTwitSnap(testTwitSnap);
    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    const res1 = await api.get("/api/twits/").expect(200);

    const data1 = res1.body;

    expect(data1).toHaveLength(1);

    await api
      .post("/api/twits/" + newTwitSnap.id + "/block")
      .expect(204);

    const res = await api.get("/api/twits/").expect(200);

    const data = res.body;

    expect(data).toHaveLength(0);
  }
  );
})

  test("can be unblocked", async () => {
    const newTwitSnap: SelectTwitsnap | null = await twitSnapService.createTwitSnap(testTwitSnap);
    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    await api
      .post("/api/twits/" + newTwitSnap.id + "/block")
      .expect(204);

    const res1 = await api.get("/api/twits/").expect(200);

    const data1 = res1.body;

    expect(data1).toHaveLength(0);

    await api.post("/api/twits/" + newTwitSnap.id + "/unblock").expect(204);

    const res = await api.get("/api/twits/").expect(200);

    const data = res.body;

    expect(data).toHaveLength(1);


});


describe("twitsnaps favourites", () => {
  beforeEach(async () => {
    await twitSnapRepository.deleteTwitsnaps();
  })

  test("can be added", async () => {
    const newTwitSnap: SelectTwitsnap | null = await twitSnapService.createTwitSnap(testTwitSnap);
    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    await api
      .post("/api/twits/" + newTwitSnap.id + "/favourite")
      .send({ userId: "12345678-1234-1234-1234-123456789012" })
      .expect(201);
  }
  );

  test("can be removed", async () => {
    const newTwitSnap: SelectTwitsnap | null = await twitSnapService.createTwitSnap(testTwitSnap);
    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    await api
      .post("/api/twits/" + newTwitSnap.id + "/favourite")
      .send({ userId: "12345678-1234-1234-1234-123456789012" })
      .expect(201);

    await api
      .delete("/api/twits/" + newTwitSnap.id + "/favourite?userId=12345678-1234-1234-1234-123456789012")
      .expect(204);
  }

  );

  test("can be obtained by user", async () => {
    const newTwitSnap: SelectTwitsnap | null = await twitSnapService.createTwitSnap(testTwitSnap);
    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    await api
      .post("/api/twits/" + newTwitSnap.id + "/favourite")
      .send({ userId: "12345678-1234-1234-1234-123456789012" })
      .expect(201);

    const res = await api.get("/api/twits/favourites/12345678-1234-1234-1234-123456789012").expect(200);

    const data = res.body;

    expect(data).toHaveLength(1);
    expect(data[0].id).toBe(newTwitSnap.id);
    expect(data[0].message).toBe(newTwitSnap.message);
    expect(data[0].createdBy).toBe(newTwitSnap.createdBy);
  }
  );

});
