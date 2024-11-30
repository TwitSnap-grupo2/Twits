import "dotenv/config";

const PORT = process.env.PORT;

const POSTGRES_URL =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_POSTGRES_URL
    : process.env.POSTGRES_URL;

const SERVICE_ID = process.env.SERVICE_ID;
const REGISTRY_URL = process.env.REGISTRY_URL;
let API_KEY;

export default {
  PORT,
  POSTGRES_URL,
  SERVICE_ID,
  REGISTRY_URL,
  API_KEY,
};
