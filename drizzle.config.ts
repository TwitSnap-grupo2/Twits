import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

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
    url: process.env.POSTGRES_URL || process.env.TEST_POSTGRES_URL!,
  },
  dialect: "postgresql",
  verbose: true,
});
