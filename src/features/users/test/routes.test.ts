import request from "supertest";
import mongoose from "mongoose";
import { createTestApp } from "../../../test/utils/testUtils";
import userRoutes from "../user.routes";
import * as authMiddleware from "../../auth/auth.middleware";
import User from "../user.model";

jest.mock("../user.model");
jest.mock("../../auth/auth.middleware");

describe("User Routes", () => {
  let mockUserId: mongoose.Types.ObjectId;
  let mockUser: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock user
    mockUserId = new mongoose.Types.ObjectId();
    mockUser = {
      _id: mockUserId,
      email: "test@example.com",
      name: "Test User",
      role: "user",
      provider: "local",
      favouriteRecipes: [],
      recipeMenu: [],
      regularItems: []
    };

    // Mock the authentication middleware to set the complete user
    (authMiddleware.authenticateToken as jest.Mock).mockImplementation(
      (req, res, next) => {
        // Set the FULL user object now
        req.user = {
          ...mockUser,
          _id: mockUserId
        };
        next();
      }
    );
  });

  describe("GET /", () => {
    it("should return user information when authenticated", async () => {
      // Create test app
      const app = createTestApp("/api/users", userRoutes);

      // Make request
      const response = await request(app).get("/api/users/");

      // Assert response
      expect(response.status).toBe(200);
      expect(response.body._id).toBe(mockUserId.toString());
      expect(response.body.email).toBe(mockUser.email);
      expect(response.body.name).toBe(mockUser.name);
      expect(authMiddleware.authenticateToken).toHaveBeenCalled();
      // No longer expect User.findById to be called
    });

    it("should not allow access when authentication fails", async () => {
      // Mock middleware to simulate authentication failure
      (authMiddleware.authenticateToken as jest.Mock).mockImplementation(
        (req, res, next) => {
          res.status(401).json({ message: "Unauthorized" });
        }
      );

      // Create test app
      const app = createTestApp("/api/users", userRoutes);

      // Make request
      const response = await request(app).get("/api/users/");

      // Assert response
      expect(response.status).toBe(401);
      expect(User.findById).not.toHaveBeenCalled();
    });
  });
});
