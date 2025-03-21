import request from "supertest";
import express from "express";
import { errorHandler } from "../error.middleware";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from "../errors";

describe("Error Middleware Integration Tests", () => {
  let app: express.Application;

  beforeEach(() => {
    // Create a fresh app for each test
    app = express();

    // Add basic middleware
    app.use(express.json());

    // Add test routes that throw different errors
    app.get("/bad-request", (req, res, next) => {
      next(new BadRequestError("Invalid parameters"));
    });

    app.get("/unauthorized", (req, res, next) => {
      next(new UnauthorizedError("Not authenticated", "AUTH_REQUIRED"));
    });

    app.get("/forbidden", (req, res, next) => {
      next(new ForbiddenError("Not authorized for this resource"));
    });

    app.get("/not-found", (req, res, next) => {
      next(new NotFoundError("Resource not found"));
    });

    app.get("/conflict", (req, res, next) => {
      next(new ConflictError("Resource already exists"));
    });

    app.get("/server-error", (req, res, next) => {
      next(new Error("Unexpected server error"));
    });

    // Add 404 handler for unknown routes
    app.use("*", (req, res) => {
      res.status(404).json({ message: "Not found" });
    });

    // Add the error middleware
    app.use(errorHandler);
  });

  it("should handle BadRequestError correctly", async () => {
    const response = await request(app).get("/bad-request");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Invalid parameters");
  });

  it("should handle UnauthorizedError correctly", async () => {
    const response = await request(app).get("/unauthorized");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Not authenticated");
    expect(response.body).toHaveProperty("errorCode", "AUTH_REQUIRED");
  });

  it("should handle ForbiddenError correctly", async () => {
    const response = await request(app).get("/forbidden");

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty(
      "message",
      "Not authorized for this resource"
    );
  });

  it("should handle NotFoundError correctly", async () => {
    const response = await request(app).get("/not-found");

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Resource not found");
  });

  it("should handle ConflictError correctly", async () => {
    const response = await request(app).get("/conflict");

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("message", "Resource already exists");
  });

  it("should handle unknown errors as 500 Internal Server Error", async () => {
    const response = await request(app).get("/server-error");

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty(
      "message",
      "An unexpected error occurred, please try again later."
    );
  });

  it("should handle 404 for non-existent routes", async () => {
    const response = await request(app).get("/non-existent-route");

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Not found");
  });
});
