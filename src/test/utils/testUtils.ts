import express, { ErrorRequestHandler, Router } from "express";
import cookieParser from "cookie-parser";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
} from "../../core/errors/errors";
import passport from "passport";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
/**
 * Create a test application with proper middleware setup
 * @param routePath - API route path (e.g., "/api/auth")
 * @param router - Express router to mount
 * @param includeErrorHandler - Whether to include the error handler middleware
 */
export function createTestApp(
  routePath?: string,
  router?: Router,
  includeErrorHandler = true
) {
  const app = express();

  // Common middleware
  app.use(express.json());
  app.use(cookieParser());
  app.use(passport.initialize());

  // Add routes if provided
  if (routePath && router) {
    app.use(routePath, router);
  }

  // Add error handler if requested
  if (includeErrorHandler) {
    addErrorHandler(app);
  }

  return app;
}

// Add error handling middleware to an Express app
export function addErrorHandler(app: express.Application) {
  // 404 handler for unknown routes
  app.use("*", (req: express.Request, res: express.Response) => {
    res.status(404).json({ message: "Not found" });
  });

  // Error handler must be the last middleware with 4 parameters
  const errorHandler: ErrorRequestHandler = (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    if (err instanceof BadRequestError) {
      res.status(400).json({ message: err.message });
      return;
    }

    if (err instanceof UnauthorizedError) {
      res.status(401).json({ message: err.message });
      return;
    }

    if (err instanceof ForbiddenError) {
      res.status(403).json({ message: err.message });
      return;
    }

    if (err instanceof ConflictError) {
      res.status(409).json({ message: err.message });
      return;
    }

    // Default to 500 for other errors
    console.error("Unhandled error:", err);
    res.status(500).json({
      message: "An unexpected error occurred",
    });
  };

  app.use(errorHandler);
}

/**
 * Creates mock request and response objects for Express controller testing
 */
export function createMockRequestResponse() {
  const mockRequest = {
    body: {},
    headers: {},
    cookies: {},
    user: undefined,
    params: {},
    query: {},
  };

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    cookie: jest.fn(),
    clearCookie: jest.fn(),
    redirect: jest.fn(),
    send: jest.fn(),
  };

  const nextFunction = jest.fn();

  return { mockRequest, mockResponse, nextFunction };
}

export const generateTestUser = async (
  email = "test@example.com",
  password = "password123",
  name = "Test User"
) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return {
    _id: new mongoose.Types.ObjectId().toString(),
    email,
    password: hashedPassword,
    name,
    role: "user",
    provider: "local",
  };
};
