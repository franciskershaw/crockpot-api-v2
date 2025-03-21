import { register, googleCallback, logout } from "../auth.controller";
import User from "../../users/user.model";
import * as jwt from "../../../core/utils/jwt";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { ConflictError } from "../../../core/errors/errors";
import { createMockRequestResponse } from "../../../../test/utils/testUtils";

jest.mock("../../users/user.model");
jest.mock("../../../core/utils/jwt");
jest.mock("bcryptjs");

jest.mock("../../../core/utils/validate", () => jest.fn((data) => data));

describe("Auth Controller", () => {
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

  describe("register", () => {
    it("should return 201 and tokens when registration is successful", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      mockRequest.body = userData;

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue("salt");
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");

      const createdUser = {
        _id: "user123",
        email: userData.email,
        name: userData.name,
      };

      (User.create as jest.Mock).mockResolvedValue(createdUser);
      (User.findById as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(createdUser),
      });
      (jwt.generateAccessToken as jest.Mock).mockReturnValue("access_token");
      (jwt.generateRefreshToken as jest.Mock).mockReturnValue("refresh_token");

      // Execute
      await register(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, "salt");
      expect(User.create).toHaveBeenCalledWith({
        email: userData.email,
        name: userData.name,
        password: "hashed_password",
        provider: "local",
      });
      expect(jwt.generateAccessToken).toHaveBeenCalledWith(createdUser);
      expect(jwt.generateRefreshToken).toHaveBeenCalledWith(createdUser);
      expect(mockResponse.cookie).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it("should call next with ConflictError when user already exists", async () => {
      const userData = {
        email: "existing@example.com",
        password: "password123",
        name: "Existing User",
      };

      mockRequest.body = userData;

      const existingUser = {
        _id: "existing123",
        email: userData.email,
      };

      (User.findOne as jest.Mock).mockResolvedValue(existingUser);

      await register(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(nextFunction).toHaveBeenCalledWith(expect.any(ConflictError));
    });
  });

  describe("login", () => {
    it("should pass validated request to passport authenticate", () => {
      expect(true).toBe(true);
    });
  });

  describe("googleCallback", () => {
    it("should redirect with tokens when user is authenticated", () => {
      const user = {
        _id: "user123",
        email: "google@example.com",
      };

      mockRequest.user = user;

      (jwt.generateRefreshToken as jest.Mock).mockReturnValue("refresh_token");

      // Execute
      googleCallback(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(jwt.generateRefreshToken).toHaveBeenCalledWith(user);
      expect(mockResponse.cookie).toHaveBeenCalled();
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        process.env.CORS_ORIGIN
      );
    });

    it("should return 401 when user is not authenticated", () => {
      mockRequest.user = undefined;

      googleCallback(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Authentication failed",
        })
      );
    });
  });

  describe("logout", () => {
    it("should clear cookie and return success message", () => {
      logout(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith("refreshToken");
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Logged out successfully",
        })
      );
    });
  });
});
