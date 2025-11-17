/**
 * @summary
 * Standardized API response formatters.
 *
 * @module utils/response
 */

interface SuccessResponse<T> {
  success: true;
  data: T;
  metadata: {
    timestamp: string;
  };
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

/**
 * Creates a standardized success response object.
 * @param data The payload to be returned.
 * @returns A success response object.
 */
export function successResponse<T>(data: T): SuccessResponse<T> {
  return {
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Creates a standardized error response object.
 * @param code A mnemonic error code (e.g., 'ValidationError').
 * @param message A human-readable error message.
 * @param details Optional additional details about the error.
 * @returns An error response object.
 */
export function errorResponse(code: string, message: string, details?: any): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
  };
}
