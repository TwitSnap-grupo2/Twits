require("dotenv").config();

const PORT = process.env.PORT;

const POSTGRES_URL =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_POSTGRES_URL
    : process.env.POSTGRES_URL;

export default {
  PORT,
  POSTGRES_URL,
};
