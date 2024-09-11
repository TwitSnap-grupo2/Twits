import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import twitsRouter from "./controllers/twits";
import errorMiddleware from "./utils/middleware";

dotenv.config();

const app = express();
// logger
if (!(process.env.NODE_ENV === "test")) {
  app.use(morgan("combined"));
}

app.use(express.json());
app.use("/api/twits", twitsRouter);

app.use(errorMiddleware);

export default app;
