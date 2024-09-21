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
});
