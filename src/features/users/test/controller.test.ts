import { Request, Response } from "express";
import mongoose from "mongoose";
import { getUserInfo } from "../user.controller";
import User from "../user.model";
import { createMockRequestResponse } from "../../../test/utils/testUtils";

jest.mock("../user.model");

describe("User Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    const mocks = createMockRequestResponse();
    mockRequest = mocks.mockRequest;
    mockResponse = mocks.mockResponse;
    nextFunction = mocks.nextFunction;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserInfo", () => {
    it("should return user information when valid user is authenticated", async () => {
      // Setup
      const userId = new mongoose.Types.ObjectId();
      const mockUser = {
        _id: userId,
        email: "test@example.com",
        name: "Test User",
        role: "user",
        provider: "local",
        favouriteRecipes: [],
        recipeMenu: [],
        regularItems: [],
      };

      // Set the authenticated user in the request
      mockRequest.user = { _id: userId };

      // Mock the User.findById to return our test user
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      // Execute
      await getUserInfo(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });

    it("should call next with error when User.findById throws an error", async () => {
      // Setup
      const userId = new mongoose.Types.ObjectId();
      const error = new Error("Database error");

      // Set the authenticated user in the request
      mockRequest.user = { _id: userId };

      // Mock the User.findById to throw an error
      (User.findById as jest.Mock).mockRejectedValue(error);

      // Execute
      await getUserInfo(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });
});
