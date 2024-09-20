import config from "../utils/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const sql = neon(config.POSTGRES_URL!);
export const db = drizzle(sql);
