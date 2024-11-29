import { type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { createErrorResponse, ErrorWithStatusCode } from "./errors";
import logger from "./logger";

/**
 * Middleware to handle requests to unknown endpoints.
 *
 * This middleware is used when no other route matches the incoming request.
 * It responds with a 404 status and a standardized error response.
 *
 * @param {Request} request - The Express request object.
 * @param {Response} response - The Express response object.
 */
// Why isn't this middleware called first? Because it's differentiated by
// the arguments it receives
export const unknownEndpoint = (request: Request, response: Response) => {
  response
    .status(404)
    .send(
      createErrorResponse(
        "about:blank",
        "Unknown endpoint",
        404,
        "No endpoint matches the url",
        request.originalUrl
      )
    );
};

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof z.ZodError) {
    logger.error("Error: ", err.flatten());

    let errDescription: string = "";
    // Flatten and then fielderrors gives you a dict of key, values, where keys are the field of which
    // validation has failed, and the value is an array with the information about that failed validation
    const errors = Object.entries(err.flatten().fieldErrors);
    errors.forEach(
      (keyVal) =>
        (errDescription +=
          keyVal[0] +
          ": " +
          keyVal[1]?.reduce((acc, curr) => acc + curr) +
          ". ")
    );

    res
      .status(400)
      .json(
        createErrorResponse(
          "about:blank",
          "Validation Error",
          400,
          errDescription,
          req.url
        )
      );
    return;
  } else if (err instanceof ErrorWithStatusCode) {
    res
      .status(err.statusCode ?? 400)
      .json(
        createErrorResponse("about:blank", err.name, 400, err.message, req.url)
      );
    return;
  } else {
    logger.error(err);
    res
      .status(500)
      .json(
        createErrorResponse(
          "about:blank",
          "Internal Server Error",
          500,
          "An unexpected error occurred",
          req.url
        )
      );
  }
};

export const apiKeyValidationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.headers.authorization; // Ensure API key is sent in the Authorization header
  console.log("🚀 ~ apiKey:", apiKey);

  if (!apiKey) {
    return res.status(401).send({ detail: "Missing API Key" });
  }

  try {
    const response = await fetch(
      `https://services-registry.onrender.com/api/registry/validate?apiKey=${apiKey}`
    );

    if (!response.ok) {
      if (response.status === 401) {
        return res.status(401).send({ detail: "Invalid API Key" });
      }
      return res.status(response.status).send({ detail: "Validation error" });
    }

    next();
  } catch (error) {
    console.error("API Key validation error:", error);
    return res
      .status(500)
      .send({ detail: "Internal server error during API key validation" });
  }
};
