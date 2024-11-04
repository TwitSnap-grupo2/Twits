import { ErrorResponse } from "./types";

/**
 * Custom error class for validation errors.
 *
 * This error is thrown when validation fails for a particular input.
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
/**
 * Creates an error response object based on the given parameters.
 *
 * @param {string} type - A URI reference that identifies the problem type.
 * @param {string} title - A short, human-readable summary of the problem.
 * @param {number} status - The HTTP status code.
 * @param {string} detail - A human-readable explanation specific to this occurrence of the problem.
 * @param {string} instance - A URI reference that identifies the specific occurrence of the problem.
 * @returns {ErrorResponse} - The constructed error response object.
 */
export const createErrorResponse = (
  type: string,
  title: string,
  status: number,
  detail: string,
  instance: string
): ErrorResponse => {
  return {
    type,
    title,
    status,
    detail,
    instance,
  };
};

export class ErrorWithStatusCode extends Error {
  statusCode: number;

  constructor(name:string, message:string, statusCode: number) {
    super(message);
    super.name = name;
    this.statusCode = statusCode;
  }
}