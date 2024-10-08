import { beforeEach, describe, expect, test } from "@jest/globals";
import supertest from "supertest";
import app from "../app";
import { testTwitSnap } from "./testHelper";
import twitSnapRepository from "../db/repositories/twits";
import twitSnapService from "../services/twits";
import { InsertTwitsnap, SelectTwitsnap } from "../db/schemas/twisnapSchema";

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
      .delete("/api/twits/" + newTwitSnap.id + "/like")
      .send({ likedBy: testTwitSnap.createdBy })
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
      .delete("/api/twits/" + newTwitSnap.id + "/like")
      .send({ likedBy: testTwitSnap.createdBy })
      .expect(204);

    await api
      .delete("/api/twits/" + newTwitSnap.id + "/like")
      .send({ likedBy: testTwitSnap.createdBy })
      .expect(400);

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
      .expect(400);
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
      .delete("/api/twits/" + newTwitSnap.id + "/share")
      .send({ sharedBy: testTwitSnap.createdBy })
      .expect(204);
  }
  );
});

describe("feed", () => {
  beforeEach(async () => {
    await twitSnapRepository.deleteTwitsnaps();
  });

  test("can be obtained when there are no twitsnaps", async () => {
    const response = await api
      .get("/api/twits/feed?timestamp_start=" + new Date().toISOString() + "&limit=10")
      .expect(200);
    expect(response.body).toHaveLength(0);
  }
  );
});
