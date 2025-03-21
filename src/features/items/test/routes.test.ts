import request from "supertest";
import mongoose from "mongoose";
import { createTestApp } from "../../../test/utils/testUtils";
import itemRoutes from "../item.routes";
import * as authMiddleware from "../../auth/auth.middleware";
import ItemCategory from "../itemCategories/itemCategory.model";
import * as itemController from "../item.controller";

jest.mock("../itemCategories/itemCategory.model");
jest.mock("../../auth/auth.middleware");
jest.mock("../item.controller");

describe("Item Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /category", () => {
    it("should return all item categories", async () => {
      // Mock data
      const mockCategories = [
        { _id: "1", name: "Category 1", faIcon: "fa-cat1" },
        { _id: "2", name: "Category 2", faIcon: "fa-cat2" },
      ];

      // Mock controller to return categories
      (itemController.getAllItemCategories as jest.Mock).mockImplementation(
        (req, res, next) => {
          res.status(200).json(mockCategories);
        }
      );

      // Create test app
      const app = createTestApp("/api/items", itemRoutes);

      // Make request
      const response = await request(app).get("/api/items/category");

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCategories);
      expect(itemController.getAllItemCategories).toHaveBeenCalled();
    });

    it("should handle errors from the controller", async () => {
      // Mock controller to throw an error
      (itemController.getAllItemCategories as jest.Mock).mockImplementation(
        (req, res, next) => {
          next(new Error("Test error"));
        }
      );

      // Create test app
      const app = createTestApp("/api/items", itemRoutes);

      // Make request
      const response = await request(app).get("/api/items/category");

      // Assert
      expect(response.status).toBe(500); // Default error handler returns 500
      expect(response.body).toHaveProperty("message");
      expect(itemController.getAllItemCategories).toHaveBeenCalled();
    });
  });

  describe("POST /category", () => {
    it("should create a new item category when user is admin", async () => {
      // Mock the authentication middleware
      (authMiddleware.authenticateToken as jest.Mock).mockImplementation(
        (req, res, next) => {
          req.user = {
            _id: new mongoose.Types.ObjectId(),
            email: "admin@example.com",
            role: "admin",
          };
          next();
        }
      );

      // Mock the admin middleware
      (authMiddleware.checkIsAdmin as jest.Mock).mockImplementation(
        (req, res, next) => next()
      );

      // Mock controller to call res.status(201).json()
      (itemController.createItemCategory as jest.Mock).mockImplementation(
        (req, res, next) => {
          res.status(201).json({
            name: "Test Category",
            faIcon: "fa-test",
          });
        }
      );

      // Create test app
      const app = createTestApp("/api/items", itemRoutes);

      // Make request
      const response = await request(app).post("/api/items/category").send({
        name: "Test Category",
        faIcon: "fa-test",
      });

      // Assert
      expect(response.status).toBe(201);
      expect(authMiddleware.authenticateToken).toHaveBeenCalled();
      expect(authMiddleware.checkIsAdmin).toHaveBeenCalled();
      expect(itemController.createItemCategory).toHaveBeenCalled();
    });

    it("should return 403 when user is not admin", async () => {
      // Mock the authentication middleware
      (authMiddleware.authenticateToken as jest.Mock).mockImplementation(
        (req, res, next) => {
          req.user = {
            _id: new mongoose.Types.ObjectId(),
            email: "user@example.com",
            role: "user",
          };
          next();
        }
      );

      // Mock the admin middleware to return 403
      (authMiddleware.checkIsAdmin as jest.Mock).mockImplementation(
        (req, res, next) => {
          res.status(403).json({ message: "Admin access required" });
        }
      );

      // Create test app
      const app = createTestApp("/api/items", itemRoutes);

      // Make request
      const response = await request(app).post("/api/items/category").send({
        name: "Test Category",
        faIcon: "fa-test",
      });

      // Assert
      expect(response.status).toBe(403);
      expect(authMiddleware.authenticateToken).toHaveBeenCalled();
      expect(authMiddleware.checkIsAdmin).toHaveBeenCalled();
      expect(itemController.createItemCategory).not.toHaveBeenCalled();
    });

    it("should return 401 when user is not authenticated", async () => {
      // Mock the authentication middleware to return 401
      (authMiddleware.authenticateToken as jest.Mock).mockImplementation(
        (req, res, next) => {
          res.status(401).json({ message: "Unauthorized" });
        }
      );

      // Create test app
      const app = createTestApp("/api/items", itemRoutes);

      // Make request
      const response = await request(app).post("/api/items/category").send({
        name: "Test Category",
        faIcon: "fa-test",
      });

      // Assert
      expect(response.status).toBe(401);
      expect(authMiddleware.authenticateToken).toHaveBeenCalled();
      expect(authMiddleware.checkIsAdmin).not.toHaveBeenCalled();
      expect(itemController.createItemCategory).not.toHaveBeenCalled();
    });
  });
});
