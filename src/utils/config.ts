require("dotenv").config();

const PORT = process.env.PORT;

const POSTGRES_URL = process.env.POSTGRES_URL;

export default {
  PORT,
  POSTGRES_URL,
};
