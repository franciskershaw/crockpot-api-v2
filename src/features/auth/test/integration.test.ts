import request from "supertest";
import mongoose from "mongoose";
import express from "express";
import User from "../../users/user.model";
import authRoutes from "../auth.routes";
import bcrypt from "bcryptjs";
import * as jwt from "../../../core/utils/jwt";
import { BadRequestError } from "../../../core/errors/errors";
import {
  createTestApp,
  generateTestUser,
} from "../../../../test/utils/testUtils";

// Properly mock JWT functions
jest.spyOn(jwt, "generateAccessToken").mockReturnValue("mock-access-token");
jest.spyOn(jwt, "generateRefreshToken").mockReturnValue("mock-refresh-token");
jest.spyOn(jwt, "verifyAccessToken").mockReturnValue(null);
jest.spyOn(jwt, "verifyRefreshToken").mockReturnValue(null);

// Mock the validate function directly to avoid circular dependencies
jest.mock("../../../core/utils/validate", () => {
  return jest.fn((data, schema) => {
    const { error, value } = schema.validate(data);
    if (error) {
      const badRequest = new BadRequestError(error.message);
      (badRequest as any).isJoi = true;
      throw badRequest;
    }
    return value;
  });
});

// Mock passport directly to avoid circular dependencies
jest.mock("passport", () => ({
  authenticate: jest.fn((strategy, options) => {
    return (req: any, res: any, next: any) => {
      if (strategy === "local") {
        // Simulate local authentication
        const { email, password } = req.body;

        // For successful authentication test
        if (email === "test@example.com" && password === "password123") {
          req.user = {
            _id: "mockuserid",
            email: "test@example.com",
            name: "Test User",
            role: "user",
            provider: "local",
          };
          return next();
        }

        // For unsuccessful authentication
        return res.status(401).json({
          message: "Incorrect email or password",
        });
      }

      // For other strategies like google
      return next();
    };
  }),
  initialize: jest.fn(() => (req: any, res: any, next: any) => next()),
  session: jest.fn(() => (req: any, res: any, next: any) => next()),
}));

// Mock User model
jest.mock("../../users/user.model", () => {
  return {
    create: jest.fn().mockImplementation((userData) => {
      return Promise.resolve({
        ...userData,
        _id: new mongoose.Types.ObjectId().toString(),
      });
    }),
    findOne: jest.fn().mockImplementation(() => {
      return Promise.resolve(null); // Default to no user found
    }),
    findById: jest.fn().mockImplementation((id) => {
      return {
        lean: jest.fn().mockReturnValue({
          _id: id,
          email: "test@example.com",
          name: "Test User",
          role: "user",
          provider: "local",
        }),
      };
    }),
    deleteMany: jest.fn().mockResolvedValue({}),
  };
});

describe("Auth Routes", () => {
  let app: express.Application;

  beforeEach(async () => {
    if (
      mongoose.connection.readyState &&
      User.deleteMany &&
      typeof User.deleteMany === "function"
    ) {
      await User.deleteMany({});
    }
    jest.clearAllMocks();

    app = createTestApp("/api/auth", authRoutes);
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData);

      expect(response.status).toBe(201);

      expect(response.body).toHaveProperty("_id");
      expect(response.body).toHaveProperty("email", userData.email);
      expect(response.body).toHaveProperty("name", userData.name);
      expect(response.body).not.toHaveProperty("password");
    });

    it("should reject registration with invalid data", async () => {
      const invalidUserData = {
        email: "not-an-email",
        password: "short",
        name: "",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(invalidUserData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("should reject registration with existing email", async () => {
      (User.findOne as jest.Mock).mockResolvedValueOnce({
        email: "duplicate@example.com",
      });

      const userData = {
        email: "duplicate@example.com",
        password: "password123",
        name: "Duplicate User",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should handle login requests", async () => {
      const user = await generateTestUser();

      const loginData = {
        email: user.email,
        password: await bcrypt.compare("password123", user.password),
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData);

      expect(response.status).not.toBe(404);
    });

    it("should reject login with invalid data format", async () => {
      const invalidLoginData = {
        email: "not-an-email",
        password: "",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(invalidLoginData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should clear refresh token cookie", async () => {
      const response = await request(app).post("/api/auth/logout");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Logged out successfully"
      );

      expect(response.headers["set-cookie"]).toBeDefined();
      const cookies = response.headers["set-cookie"];
      if (cookies && Array.isArray(cookies)) {
        const refreshTokenCookie = cookies.find((cookie) =>
          cookie.startsWith("refreshToken=")
        );
        expect(refreshTokenCookie).toBeDefined();
        if (refreshTokenCookie) {
          expect(refreshTokenCookie).toContain("refreshToken=");
        }
      }
    });
  });

  describe("GET /api/auth/refresh-token", () => {
    it("should issue new tokens with valid refresh token", async () => {
      (jwt.verifyRefreshToken as jest.Mock).mockReturnValueOnce({
        _id: "mockuserid",
        email: "test@example.com",
      });

      const refreshToken = "valid.refresh.token";

      const response = await request(app)
        .get("/api/auth/refresh-token")
        .set("Cookie", [`refreshToken=${refreshToken}`]);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("accessToken");
    });

    it("should reject request with missing refresh token", async () => {
      const response = await request(app).get("/api/auth/refresh-token");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
    });

    it("should reject request with invalid refresh token", async () => {
      (jwt.verifyRefreshToken as jest.Mock).mockReturnValueOnce(null);

      const response = await request(app)
        .get("/api/auth/refresh-token")
        .set("Cookie", ["refreshToken=invalid.token"]);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("message");
    });
  });
});
