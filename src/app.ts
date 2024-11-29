import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerOutput from "./swagger_output.json";
import { routes } from "./controllers/index";
import {
  apiKeyValidationMiddleware,
  errorMiddleware,
  unknownEndpoint,
} from "./utils/middleware";

dotenv.config();

const app = express();
// logger
if (!(process.env.NODE_ENV === "test")) {
  app.use(morgan("combined"));
}

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerOutput));

app.use(apiKeyValidationMiddleware);

app.use("/", routes);

app.use(errorMiddleware);
app.use(unknownEndpoint);

export default app;
