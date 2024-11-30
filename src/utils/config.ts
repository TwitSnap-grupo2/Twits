import logger from "./logger";

import "dotenv/config";

const PORT = process.env.PORT;

const POSTGRES_URL =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_POSTGRES_URL
    : process.env.POSTGRES_URL;

const SERVICE_ID = process.env.SERVICE_ID;
const REGISTRY_URL = process.env.REGISTRY_URL;
let API_KEY;

const getApiKey = async () => {
  if (!SERVICE_ID || !REGISTRY_URL) {
    logger.error("Missing SERVICE_ID or REGISTRY_URL environment variables");
    // process.exit(1);
  }

  try {
    const response = await fetch(`${REGISTRY_URL}/api/registry/${SERVICE_ID}`);
    if (!response.ok) {
      logger.error("Error trying to get API Key");
      // process.exit(1);
    }

    const data = await response.json();
    logger.info("API_KEY fetched successfully");
    //@ts-ignore
    API_KEY = data!.apiKey;
  } catch (error) {
    logger.error("API Key fetch error:", error);
    // process.exit(1);
  }
};

await getApiKey();
console.log(`API_KEY: ${API_KEY}`);

export default {
  PORT,
  POSTGRES_URL,
  API_KEY,
};
