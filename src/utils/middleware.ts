import { type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { createErrorResponse } from "./errors";
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
  } else if (err instanceof Error) {
    const error = err as Error & { statusCode?: number };
    res
      .status(error.statusCode ?? 400)
      .json(
        createErrorResponse(
          "about:blank",
          error.name,
          400,
          error.message,
          req.url
        )
      );
    return;
  }
};
