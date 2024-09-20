import express from "express";

import twitSnapRouter from "./twits";

export const routes = express.Router();

routes.use("/api/twits", twitSnapRouter);
