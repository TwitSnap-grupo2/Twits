import { beforeEach, describe, expect, test } from "@jest/globals";
import supertest from "supertest";
import app from "../app";
import { testTwitSnap } from "./testHelper";
import twitSnapRepository from "../db/repositories/twits";
import twitSnapService from "../services/twits";
import { InsertTwitsnap, SelectTwitsnap } from "../db/schemas/twisnapSchema";
import { before } from "node:test";

const api = supertest(app);

describe("twitsnaps", () => {
  beforeEach(async () => {
    await twitSnapRepository.deleteTwitsnaps();
  });

  test("can be obtained when there are no twitsnaps", async () => {
    const response = await api.get("/api/twits").expect(200);
    expect(response.body).toHaveLength(0);
  });

  test("can be created", async () => {
    const response = await api
      .post("/api/twits")
      .send(testTwitSnap)
      .expect(201);

    const data: InsertTwitsnap = response.body;

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

    const response = await api.get("/api/twits").expect(200);

    const data: Array<SelectTwitsnap> = response.body;

    expect(data).toHaveLength(1);

    expect(data[0].id).toBe(newTwitSnap.id);
    expect(data[0].message).toBe(newTwitSnap.message);
    expect(data[0].createdBy).toBe(newTwitSnap.createdBy);
    expect(data[0].createdAt).toBe(newTwitSnap.createdAt.toISOString());
  });

  test("can be obtained by id", async () => {
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

    const response = await api
      .get("/api/twits/" + newTwitSnap.createdBy)
      .expect(200);

    const data: Array<SelectTwitsnap> = response.body;

    expect(data).toHaveLength(1);

    expect(data[0].id).toBe(newTwitSnap.id);
    expect(data[0].message).toBe(newTwitSnap.message);
    expect(data[0].createdBy).toBe(newTwitSnap.createdBy);
    expect(data[0].createdAt).toBe(newTwitSnap.createdAt.toISOString());
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

    const response = await api
      .get("/api/twits/search?q=twitsnap")
      .expect(200);

    const data: Array<SelectTwitsnap> = response.body;

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

    const response = await api
      .patch("/api/twits/" + newTwitSnap.id)
      .send({ message: "This is an edited twitsnap" })
      .expect(200);

    const data: InsertTwitsnap = response.body;

    expect(data.id).toBe(newTwitSnap.id);
    expect(data.message).toBe("This is an edited twitsnap");
    expect(data.createdBy).toBe(newTwitSnap.createdBy);
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

    const response = await api
      .post("/api/twits/" + newTwitSnap.id + "/like")
      .send({ likedBy: testTwitSnap.createdBy })
      .expect(201);

    const data = response.body;

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

    const response = await api
      .get("/api/twits/" + newTwitSnap.id + "/like")
      .expect(200);

    const data = response.body;

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

    const response = await api
      .post("/api/twits/" + newTwitSnap.id + "/share")
      .send({ sharedBy: testTwitSnap.createdBy })
      .expect(201);

    const data = response.body;

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
    const response = await api
      .post("/api/twits/feed")
      .send(body)
      .expect(200);
    expect(response.body).toHaveLength(0);
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
    const response = await api
      .post("/api/twits/feed")
      .send(body)
      .expect(200);


    const data = response.body;

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

    const response = await api
      .post("/api/twits/feed")
      .send(body)
      .expect(200);

    const data = response.body;

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

    const response = await api
      .post("/api/twits/feed")
      .send(body)
      .expect(200);

    const data = response.body;

    expect(data).toHaveLength(1);

    expect(data[0].id).toBe(second_twitsnap.id);
    expect(data[0].message).toBe(second_twitsnap.message);
    expect(data[0].createdBy).toBe(second_twitsnap.createdBy);
    expect(data[0].createdAt).toBe(second_twitsnap.createdAt.toISOString());
  }
  );

  test("can be obtained with likes, shares count, and responses", async () => {
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

    await twitSnapService.createResponse(newTwitSnap.id, {
      message: "This is a response",
      createdBy: "12345678-1234-1234-1234-123456789012",
    });

    const body = {
      timestamp_start: new Date().toISOString(),
      limit: 10,
      followeds: ["12345678-1234-1234-1234-123456789012"],
    }
    const response = await api
      .post("/api/twits/feed")
      .send(body)
      .expect(200);

    const data = response.body;

    expect(data).toHaveLength(2);

    expect(data[0].id).toBe(newTwitSnap.id);
    expect(data[0].message).toBe(newTwitSnap.message);
    expect(data[0].createdBy).toBe(newTwitSnap.createdBy);
    expect(data[0].sharedBy).toBe("12345678-1234-1234-1234-123456789012");
    expect(data[0].likes_count).toBe("1");
    expect(data[0].shares_count).toBe("1");
    expect(data[0].responses_count).toBe("1");
  });
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
    expect(res[0].name).toBe("#twitsnap");

})

  test("twitsnaps can be obtained by hashtag", async () => {
    const newTwitSnap: SelectTwitsnap | null = await twitSnapService.createTwitSnap({
      message: "This is a #twitsnap",
      createdBy: "12345678-1234-1234-1234-123456789012",
    });

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    const res = await twitSnapRepository.getTwitSnapsByHashtag("#twitsnap");

    expect(res).toHaveLength(1);
    expect(res[0].id).toBe(newTwitSnap.id);
    expect(res[0].message).toBe(newTwitSnap.message);
    expect(res[0].createdBy).toBe(newTwitSnap.createdBy);
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



    const res = await twitSnapRepository.searchHashtags("twitsnap");

    expect(res).toHaveLength(2);
    expect(res[0]).toBe("#twitsnap");
    expect(res[1]).toBe("#anothertwitsnap");
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
    expect(res[0].name).toBe("#twitsnap");

    await api.patch("/api/twits/" + newTwitSnap.id).send({ message: "This is a #anothertwitsnap" }).expect(200);

    const res2 = await twitSnapRepository.getTwitSnapHashtags(newTwitSnap.id);

    expect(res2).toHaveLength(1);
    expect(res2[0].name).toBe("#anothertwitsnap");
    
  }
);

});

describe("stats", () => {
  beforeEach(async () => {
    await twitSnapRepository.deleteTwitsnaps();
  }
);

  test("can be obtained", async () => {
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

    await twitSnapService.createResponse(twit1.id, {
      message: "This is a response",
      createdBy: "12345678-1234-1234-1234-123456789012",
    });

    await twitSnapService.createResponse(twit1.id, {
      message: "This is another response",
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


    const response = await api.get("/api/twits/stats/12345678-1234-1234-1234-123456789012?limit=7").expect(200);
    const data = response.body;

    expect(data.twitsTotal).toBe(2);
    expect(data.sharesTotal).toBe(1);
    expect(data.likesTotal).toBe(2);
    expect(data.responsesTotal).toBe(2);

  }, 6000);
})

describe("twitsnaps responses", () => {
  beforeEach(async () => {
    await twitSnapRepository.deleteTwitsnaps();
    await twitSnapRepository.deleteAllTwitSnapResponses();
  })

  test("can be created", async () => {
    const newTwitSnap: SelectTwitsnap | null = await twitSnapService.createTwitSnap(testTwitSnap);

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    const response = await api
      .post("/api/twits/" + newTwitSnap.id + "/response")
      .send({ message: "This is a response", createdBy: "12345678-1234-1234-1234-123456789012" })
      .expect(201);

    const data = response.body;

    expect(data.inResponseToId).toBe(newTwitSnap.id);
    expect(data.message).toBe("This is a response");
    expect(data.createdBy).toBe("12345678-1234-1234-1234-123456789012");
  }
  );

  test("cannot be created if twitsnap does not exist", async () => {
    await api
      .post("/api/twits/12345678-1234-1234-1234-123456789012/response")
      .send({ message: "This is a response", createdBy: "12345678-1234-1234-1234-123456789012" })
      .expect(404);
  }
  );

  test("can be obtained by twitsnap id", async () => {
    const newTwitSnap: SelectTwitsnap | null = await twitSnapService.createTwitSnap(testTwitSnap);

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    await twitSnapService.createResponse(newTwitSnap.id, {
      message: "This is a response",
      createdBy: "12345678-1234-1234-1234-123456789012",
    });

    await twitSnapService.createResponse(newTwitSnap.id, {
      message: "This is another response",
      createdBy: "12345678-1234-4234-1234-123456789012"
    });

    const response = await api
      .get("/api/twits/" + newTwitSnap.id + "/responses")
      .expect(200);

    const data = response.body;

    expect(data).toHaveLength(2);

    expect(data[0].message).toBe("This is another response");
    expect(data[1].message).toBe("This is a response");
  }
  
);

  test("can be responded to", async () => {
    const newTwitSnap: SelectTwitsnap | null = await twitSnapService.createTwitSnap(testTwitSnap);

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    const response = await api
      .post("/api/twits/" + newTwitSnap.id + "/response")
      .send({ message: "This is a response", createdBy: "12345678-1234-1234-1234-123456789012" })
      .expect(201);

    const data = response.body;

    expect(data.inResponseToId).toBe(newTwitSnap.id);
    expect(data.message).toBe("This is a response");
    expect(data.createdBy).toBe("12345678-1234-1234-1234-123456789012");

    const response2 = await api.post("/api/twits/" + data.id + "/response").send({ message: "This is a response to a response", createdBy: "12345678-1234-1234-1234-123456789012" }).expect(201);

    const data2 = response2.body;

    expect(data2.inResponseToId).toBe(data.id);
    expect(data2.message).toBe("This is a response to a response");
  })

  test("can be deleted", async () => {
    const newTwitSnap: SelectTwitsnap | null = await twitSnapService.createTwitSnap(testTwitSnap);

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    const response = await api
      .post("/api/twits/" + newTwitSnap.id + "/response")
      .send({ message: "This is a response", createdBy: "12345678-1234-1234-1234-123456789012" })
      .expect(201);

    const data = response.body;

    await api.delete("/api/twits/" + data.id + "/response").expect(204);
  }
  );

  test("can be edited", async () => {
    const newTwitSnap: SelectTwitsnap | null = await twitSnapService.createTwitSnap(testTwitSnap);

    if (!newTwitSnap) {
      throw new Error("Error creating twitsnap");
    }

    const response = await api
      .post("/api/twits/" + newTwitSnap.id + "/response")
      .send({ message: "This is a response", createdBy: "12345678-1234-1234-1234-123456789012" })
      .expect(201);

    const data = response.body;

    const response2 = await api
      .patch("/api/twits/" + data.id + "/response")
      .send({ message: "This is an edited response" })
      .expect(200);

    const data2 = response2.body;

    expect(data2.id).toBe(data.id);
    expect(data2.message).toBe("This is an edited response");
    expect(data2.createdBy).toBe(data.createdBy);
  }
  );


});
