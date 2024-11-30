import app from "./app";
import config from "./utils/config";
import logger from "./utils/logger";
app.listen(config.PORT, async () => {
  if (!config.SERVICE_ID || !config.REGISTRY_URL) {
    logger.error("Missing SERVICE_ID or REGISTRY_URL environment variables");
    // process.exit(1);
  }

  try {
    const response = await fetch(
      `${config.REGISTRY_URL}/api/registry/${config.SERVICE_ID}`
    );
    if (!response.ok) {
      logger.error("Error trying to get API Key");
      // process.exit(1);
    }

    const data = await response.json();
    logger.info("API_KEY fetched successfully");
    //@ts-ignore
    config.API_KEY = data!.apiKey;
    console.log("🚀 ~ app.listen ~ API_KEY:", config.API_KEY);
  } catch (error) {
    logger.error("API Key fetch error:", error);
    // process.exit(1);
  }

  logger.info(`Server listening on port ${config.PORT}`);
});
