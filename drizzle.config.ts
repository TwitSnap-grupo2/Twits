import { defineConfig } from "drizzle-kit";
import config from "./src/utils/config";
require("dotenv").config();

export default defineConfig({
  schema:
    process.env.NODE_ENV === "production"
      ? "./dist/src/db/schemas/*"
      : "./src/db/schemas/*",
  out:
    process.env.NODE_ENV === "production"
      ? "./dist/src/db/migrations"
      : "./src/db/migrations",
  dbCredentials: {
    url: config.POSTGRES_URL as string,
  },
  dialect: "postgresql",
  verbose: true,
});
