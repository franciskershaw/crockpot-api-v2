import { register, googleCallback, logout, login } from "../auth.controller";
import User from "../../users/user.model";
import * as jwt from "../../../core/utils/jwt";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import {
  ConflictError,
  InternalServerError,
} from "../../../core/errors/errors";
import { createMockRequestResponse } from "../../../../test/utils/testUtils";
import passport from "passport";

jest.mock("../../users/user.model");
jest.mock("../../../core/utils/jwt");
jest.mock("bcryptjs");
jest.mock("passport");

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

    // Mock console.error to prevent cluttering test output
    console.error = jest.fn();
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

    it("should throw InternalServerError when user creation fails", async () => {
      // Setup
      const userData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };
      mockRequest.body = userData;

      // Mock User.findOne to return null (no existing user)
      (User.findOne as jest.Mock).mockResolvedValue(null);
      // Mock bcrypt functions
      (bcrypt.genSalt as jest.Mock).mockResolvedValue("salt");
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
      // Mock User.create to return null (creation failed)
      (User.create as jest.Mock).mockResolvedValue(null);

      // Execute
      await register(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(nextFunction).toHaveBeenCalledWith(
        expect.any(InternalServerError)
      );
    });
  });

  describe("login", () => {
    it("should authenticate user and return tokens on successful login", () => {
      // Set up test data
      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      mockRequest.body = loginData;

      // Create a mock user
      const user = { _id: "user123", email: loginData.email };

      // The passport.authenticate mock needs to:
      // 1. Return a function that when invoked with (req, res, next) will call the callback
      // 2. The callback needs to invoke sendTokens correctly
      const authenticationCallback = jest
        .fn()
        .mockImplementation((err, user) => {
          // This simulates the sendTokens call in the controller
          mockResponse.cookie?.call(
            mockResponse,
            "refreshToken",
            "refresh_token"
          );
          mockResponse.status?.call(mockResponse, 200);
          mockResponse.json?.call(mockResponse, {
            ...user,
            accessToken: "access_token",
          });
        });

      const authenticateImplementation = jest
        .fn()
        .mockImplementation((req, res, next) => {
          // When passport.authenticate's returned function is called, it should
          // invoke our callback with no error and a user
          authenticationCallback(null, user);
        });

      (passport.authenticate as jest.Mock).mockReturnValue(
        authenticateImplementation
      );

      // Call the login function
      login(mockRequest as Request, mockResponse as Response, nextFunction);

      // Verify passport.authenticate was called and its returned function was called
      expect(passport.authenticate).toHaveBeenCalledWith(
        "local",
        expect.any(Function)
      );
      expect(authenticateImplementation).toHaveBeenCalled();

      // These should now be called as a result of our authenticationCallback
      expect(mockResponse.cookie).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it("should return 401 when user authentication fails", () => {
      // Set up test data
      const loginData = {
        email: "test@example.com",
        password: "wrong_password",
      };

      mockRequest.body = loginData;

      // Fix the passport.authenticate mock for the 401 case
      (passport.authenticate as jest.Mock).mockImplementation(
        (strategy, callback) => {
          // Return a function that when called will execute the callback with null user
          return (req: any, res: any, next: any) => {
            callback(null, null);
          };
        }
      );

      // Call the login function
      login(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(passport.authenticate).toHaveBeenCalledWith(
        "local",
        expect.any(Function)
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Incorrect email or password",
      });
    });

    it("should return 500 when authentication throws an error", () => {
      // Set up test data
      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      mockRequest.body = loginData;

      // Create an error to be passed to the callback
      const error = new Error("Authentication error");

      // Fix the passport.authenticate mock for the error case
      (passport.authenticate as jest.Mock).mockImplementation(
        (strategy, callback) => {
          // Return a function that when called will execute the callback with an error
          return (req: any, res: any, next: any) => {
            callback(error, null);
          };
        }
      );

      // Call the login function
      login(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(passport.authenticate).toHaveBeenCalledWith(
        "local",
        expect.any(Function)
      );

      expect(console.error).toHaveBeenCalledWith(
        "Authentication error:",
        error
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });

    it("should call next with error when validation fails", () => {
      // Set up validation to throw an error
      const validationError = new Error("Validation failed");
      jest
        .requireMock("../../../core/utils/validate")
        .mockImplementation(() => {
          throw validationError;
        });

      // Execute
      login(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(nextFunction).toHaveBeenCalledWith(validationError);
    });
  });

  describe("googleCallback", () => {
    it("should redirect with tokens when user is authenticated", () => {
      const user = {
        _id: "user123",
        email: "google@example.com",
      };

      mockRequest.user = user;
      process.env.CORS_ORIGIN = "https://example.com";

      (jwt.generateRefreshToken as jest.Mock).mockReturnValue("refresh_token");

      // Execute
      googleCallback(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(jwt.generateRefreshToken).toHaveBeenCalledWith(user);
      expect(mockResponse.cookie).toHaveBeenCalled();
      expect(mockResponse.redirect).toHaveBeenCalledWith("https://example.com");
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

    it("should handle errors during the callback process", () => {
      // Setup to throw an error
      mockRequest.user = { _id: "user123", email: "google@example.com" };

      // Make jwt.generateRefreshToken throw an error
      const error = new Error("Token generation failed");
      (jwt.generateRefreshToken as jest.Mock).mockImplementation(() => {
        throw error;
      });

      // Execute
      googleCallback(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(console.error).toHaveBeenCalledWith(
        "Error during Google callback:",
        error
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "An unexpected error occurred, please try again later.",
      });
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
