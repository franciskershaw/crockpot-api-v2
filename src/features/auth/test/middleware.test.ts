import { authenticateToken, refreshTokens } from "../auth.middleware";
import * as jwt from "../../../core/utils/jwt";
import { Request, Response } from "express";
import { UnauthorizedError, ForbiddenError } from "../../../core/errors/errors";
import { createMockRequestResponse } from "../../../test/utils/testUtils";
import { createTestUserObject } from "../../../test/utils/authMocks";
import User from "../../../features/users/user.model";

jest.mock("../../../core/utils/jwt", () => ({
  verifyAccessToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
}));

jest.mock("../../../features/users/user.model");

describe("Auth Middleware", () => {
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

  describe("authenticateToken", () => {
    it("should call next with unauthorized error when no token is provided", async () => {
      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect(nextFunction.mock.calls[0][0].message).toBe("No token provided");
    });

    it("should call next with unauthorized error when token is invalid", async () => {
      mockRequest.headers = { authorization: "Bearer invalid_token" };
      (jwt.verifyAccessToken as jest.Mock).mockReturnValue(null);

      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(jwt.verifyAccessToken).toHaveBeenCalledWith("invalid_token");
      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect(nextFunction.mock.calls[0][0].message).toBe(
        "Invalid or expired access token"
      );
    });

    it("should set user on request when token is valid", async () => {
      // Set up JWT payload
      const tokenPayload = { _id: "user123", email: "test@example.com" };
      mockRequest.headers = { authorization: "Bearer valid_token" };
      (jwt.verifyAccessToken as jest.Mock).mockReturnValue(tokenPayload);

      // Set up a full user object to be returned from database
      const fullUser = {
        _id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: "user",
        provider: "local",
      };

      // Mock User.findById with lean() chaining
      (User.findById as jest.Mock).mockReturnValue({
        lean: jest.fn().mockReturnValue(fullUser),
      });

      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(jwt.verifyAccessToken).toHaveBeenCalledWith("valid_token");
      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(mockRequest.user).toEqual(fullUser);
      expect(nextFunction).toHaveBeenCalledWith();
    });

    it("should call next with error when user is not found", async () => {
      // Set up JWT payload
      const tokenPayload = {
        _id: "nonexistent_user",
        email: "test@example.com",
      };
      mockRequest.headers = { authorization: "Bearer valid_token" };
      (jwt.verifyAccessToken as jest.Mock).mockReturnValue(tokenPayload);

      // Mock user not found
      (User.findById as jest.Mock).mockReturnValue({
        lean: jest.fn().mockReturnValue(null),
      });

      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(jwt.verifyAccessToken).toHaveBeenCalledWith("valid_token");
      expect(User.findById).toHaveBeenCalledWith("nonexistent_user");
      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect(nextFunction.mock.calls[0][0].message).toBe("User not found");
    });

    it("should call next with error when token format is invalid", async () => {
      // Set up invalid token format (missing _id)
      const tokenPayload = { email: "test@example.com" };
      mockRequest.headers = { authorization: "Bearer invalid_format_token" };
      (jwt.verifyAccessToken as jest.Mock).mockReturnValue(tokenPayload);

      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(jwt.verifyAccessToken).toHaveBeenCalledWith(
        "invalid_format_token"
      );
      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect(nextFunction.mock.calls[0][0].message).toBe(
        "Invalid token format"
      );
    });
  });

  describe("refreshTokens", () => {
    it("should call next with unauthorized error when no refresh token is provided", () => {
      refreshTokens(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect(nextFunction.mock.calls[0][0].message).toBe(
        "No refresh token provided"
      );
    });

    it("should call next with forbidden error when refresh token is invalid", () => {
      mockRequest.cookies = { refreshToken: "invalid_token" };
      (jwt.verifyRefreshToken as jest.Mock).mockReturnValue(null);

      refreshTokens(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(jwt.verifyRefreshToken).toHaveBeenCalledWith("invalid_token");
      expect(mockResponse.clearCookie).toHaveBeenCalledWith("refreshToken");
      expect(nextFunction).toHaveBeenCalledWith(expect.any(ForbiddenError));
      expect(nextFunction.mock.calls[0][0].message).toBe(
        "Invalid or expired refresh token"
      );
    });

    it("should generate new tokens and return them when refresh token is valid", () => {
      const user = createTestUserObject();
      mockRequest.cookies = { refreshToken: "valid_token" };
      (jwt.verifyRefreshToken as jest.Mock).mockReturnValue(user);
      (jwt.generateAccessToken as jest.Mock).mockReturnValue(
        "new_access_token"
      );
      (jwt.generateRefreshToken as jest.Mock).mockReturnValue(
        "new_refresh_token"
      );

      refreshTokens(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(jwt.verifyRefreshToken).toHaveBeenCalledWith("valid_token");
      expect(jwt.generateAccessToken).toHaveBeenCalledWith(user);
      expect(jwt.generateRefreshToken).toHaveBeenCalledWith(user);
      expect(mockResponse.cookie).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        accessToken: "new_access_token",
      });
    });
  });
});
