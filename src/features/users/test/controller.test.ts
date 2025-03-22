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
    it("should return user information from req.user", async () => {
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
        regularItems: []
      };

      // Set the authenticated user in the request
      mockRequest.user = mockUser;

      // Execute
      await getUserInfo(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });

    it("should call next with error if an exception occurs", async () => {
      // Setup
      mockRequest.user = {}; // Set minimal user
      
      // Make response.json throw an error
      const error = new Error("Response error");
      mockResponse.json = jest.fn().mockImplementation(() => {
        throw error;
      });

      // Execute
      await getUserInfo(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });
});
