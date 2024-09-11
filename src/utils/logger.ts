import pino from "pino";

const logger = pino({
  name: "Twits",
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  // Disable when running tests
  enabled: !(process.env.NODE_ENV === "test"),
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

export default logger;
