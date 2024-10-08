import express from "express";

import twitSnapRouter from "./twits";

export const routes = express.Router();

routes.use(" test("can be obtained if there are no twitsnaps", async () => {
    const response = await api.get("/api/twits/feed").send({ userId: "12345678-1234-f234-1234-123456789012", timestamp_start: new Date(), limit: 10 }).expect(200);
    expect(response.body).toHaveLength(0);
  }
  );", twitSnapRouter);
