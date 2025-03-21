import { errorHandler } from "../error.middleware";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
  InternalServerError,
} from "../errors";
import { createMockRequestResponse } from "../../../../test/utils/testUtils";

// Mock console.log to avoid cluttering test output
console.log = jest.fn();

describe("Error Middleware", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    // Clear mock calls between tests
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  it("should handle BadRequestError", () => {
    const { mockRequest, mockResponse, nextFunction } =
      createMockRequestResponse();
    const errorMessage = "Invalid input";
    const error = new BadRequestError(errorMessage);

    errorHandler(error, mockRequest as any, mockResponse as any, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: errorMessage,
      stack: expect.any(String),
    });
  });

  it("should handle UnauthorizedError", () => {
    const { mockRequest, mockResponse, nextFunction } =
      createMockRequestResponse();
    const errorMessage = "Not authenticated";
    const errorCode = "INVALID_TOKEN";
    const error = new UnauthorizedError(errorMessage, errorCode);

    errorHandler(error, mockRequest as any, mockResponse as any, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: errorMessage,
      errorCode: errorCode,
    });
  });

  it("should handle ForbiddenError", () => {
    const { mockRequest, mockResponse, nextFunction } =
      createMockRequestResponse();
    const errorMessage = "Access denied";
    const error = new ForbiddenError(errorMessage);

    errorHandler(error, mockRequest as any, mockResponse as any, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: errorMessage,
      stack: expect.any(String),
    });
  });

  it("should handle NotFoundError", () => {
    const { mockRequest, mockResponse, nextFunction } =
      createMockRequestResponse();
    const errorMessage = "Resource not found";
    const error = new NotFoundError(errorMessage);

    errorHandler(error, mockRequest as any, mockResponse as any, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: errorMessage,
      stack: expect.any(String),
    });
  });

  it("should handle ConflictError", () => {
    const { mockRequest, mockResponse, nextFunction } =
      createMockRequestResponse();
    const errorMessage = "Resource already exists";
    const error = new ConflictError(errorMessage);

    errorHandler(error, mockRequest as any, mockResponse as any, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: errorMessage,
      stack: expect.any(String),
    });
  });

  it("should provide generic message for InternalServerError", () => {
    const { mockRequest, mockResponse, nextFunction } =
      createMockRequestResponse();
    const errorMessage = "Database connection failed";
    const error = new InternalServerError(errorMessage);

    errorHandler(error, mockRequest as any, mockResponse as any, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "An unexpected error occurred, please try again later.",
      stack: expect.any(String),
    });
  });

  it("should handle unknown errors", () => {
    const { mockRequest, mockResponse, nextFunction } =
      createMockRequestResponse();
    const error = new Error("Some unknown error");

    errorHandler(error, mockRequest as any, mockResponse as any, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "An unexpected error occurred, please try again later.",
      stack: expect.any(String),
    });
  });

  it("should not include stack trace in production environment", () => {
    process.env.NODE_ENV = "production";

    const { mockRequest, mockResponse, nextFunction } =
      createMockRequestResponse();
    const errorMessage = "Bad request";
    const error = new BadRequestError(errorMessage);

    errorHandler(error, mockRequest as any, mockResponse as any, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: errorMessage,
      stack: null,
    });
  });

  it("should log errors in development environment", () => {
    process.env.NODE_ENV = "development";

    const { mockRequest, mockResponse, nextFunction } =
      createMockRequestResponse();
    const error = new Error("Test error");

    errorHandler(error, mockRequest as any, mockResponse as any, nextFunction);

    expect(console.log).toHaveBeenCalled();
  });
});
