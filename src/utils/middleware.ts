import { type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { createErrorResponse } from "./errors";

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
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.log("🚀 ~ err:", err);

  if (err instanceof z.ZodError) {
    res.status(400).json({
      error: err.flatten(),
    });
    return;
  } else if (err instanceof Error) {
    const error = err as Error & { statusCode?: number };
    res.status(error.statusCode ?? 400).json({
      message: err.message,
    });
    return;
  }
};
