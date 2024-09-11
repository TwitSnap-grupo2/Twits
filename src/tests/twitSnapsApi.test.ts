import { beforeEach, describe, expect, test } from "@jest/globals";
import supertest from "supertest";
import app from "../app";
import testHelper, { testTwitSnap } from "./testHelper";
import { NewTwitSnap, TwitSnap } from "../utils/types";

const api = supertest(app);

describe("twitsnaps", () => {
  beforeEach(() => {
    testHelper.resetTwitsSnapsDB();
  });

  test("can be obtained when there are no twitsnaps", async () => {
    const response = await api.get("/api/twits").expect(200);
    expect(response.body.data).toHaveLength(0);
  });

  test("can be created", async () => {
    const response = await api
      .post("/api/twits")
      .send(testTwitSnap)
      .expect(201);

    const data: TwitSnap = response.body.data;

    expect(data.id).toBeDefined();
    expect(data.createdAt).toBeDefined();
    expect(data.message).toBe(testTwitSnap.message);
    expect(data.createdBy).toBe(testTwitSnap.createdBy);
  });

  test("can be obtained when there is a twitsnap", async () => {
    const newTwitSnap: TwitSnap = testHelper.createTwitSnap(testTwitSnap);

    const response = await api.get("/api/twits").expect(200);

    const data: Array<TwitSnap> = response.body.data;

    expect(data).toHaveLength(1);

    expect(data[0].id).toBe(newTwitSnap.id);
    expect(data[0].message).toBe(newTwitSnap.message);
    expect(data[0].createdBy).toBe(newTwitSnap.createdBy);
    expect(data[0].createdAt).toBe(newTwitSnap.createdAt);
  });
});
