import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../jwt";
import { IUser } from "../../../features/users/user.model";
import mongoose from "mongoose";
import { JwtPayload } from "jsonwebtoken";

// Skip these tests in CI environments
const runIntegrationTests = !process.env.CI;
const testGroup = runIntegrationTests ? describe : describe.skip;

testGroup("JWT Utilities Integration Tests", () => {
  let mockUser: Partial<IUser>;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Create a mock user with required fields
    mockUser = {
      _id: new mongoose.Types.ObjectId(),
      email: "test@example.com",
      name: "Test User",
      role: "user",
    };

    // Save original environment variables
    originalEnv = { ...process.env };

    // Set up environment variables for testing
    process.env.JWT_SECRET = "integration-test-jwt-secret";
    process.env.JWT_REFRESH_SECRET = "integration-test-jwt-refresh-secret";
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  it("should generate and verify an access token", () => {
    // Ensure mockUser has required fields
    if (!mockUser._id) {
      throw new Error("Mock user _id is not defined");
    }

    // Generate a token
    const token = generateAccessToken(mockUser as IUser);

    // Verify the token
    const payload = verifyAccessToken(token);

    // Check that payload contains expected user data
    expect(payload).toBeTruthy();

    // Type assertion since we know it's not null based on the above check
    const jwtPayload = payload as JwtPayload;

    expect(jwtPayload).toHaveProperty("_id", mockUser._id.toString());
    expect(jwtPayload).toHaveProperty("email", mockUser.email);
    expect(jwtPayload).toHaveProperty("iat");
    expect(jwtPayload).toHaveProperty("exp");

    // Check that expiration is set to approximately 30 minutes
    const iat = jwtPayload.iat as number;
    const exp = jwtPayload.exp as number;
    const expiresInSeconds = exp - iat;
    expect(expiresInSeconds).toBeCloseTo(1800, -2); // 30 minutes in seconds, with tolerance
  });

  it("should generate and verify a refresh token", () => {
    // Ensure mockUser has required fields
    if (!mockUser._id) {
      throw new Error("Mock user _id is not defined");
    }

    // Generate a token
    const token = generateRefreshToken(mockUser as IUser);

    // Verify the token
    const payload = verifyRefreshToken(token);

    // Check that payload contains expected user data
    expect(payload).toBeTruthy();

    // Type assertion since we know it's not null based on the above check
    const jwtPayload = payload as JwtPayload;

    expect(jwtPayload).toHaveProperty("_id", mockUser._id.toString());
    expect(jwtPayload).toHaveProperty("email", mockUser.email);
    expect(jwtPayload).toHaveProperty("iat");
    expect(jwtPayload).toHaveProperty("exp");

    // Check that expiration is set to approximately 7 days
    const iat = jwtPayload.iat as number;
    const exp = jwtPayload.exp as number;
    const expiresInSeconds = exp - iat;
    expect(expiresInSeconds).toBeCloseTo(7 * 24 * 60 * 60, -2); // 7 days in seconds, with tolerance
  });

  it("should return null for an invalid access token", () => {
    const result = verifyAccessToken("invalid-token");
    expect(result).toBeNull();
  });

  it("should return null for an invalid refresh token", () => {
    const result = verifyRefreshToken("invalid-refresh-token");
    expect(result).toBeNull();
  });

  it("should detect a refresh token used with access token verification", () => {
    // Generate a refresh token
    const refreshToken = generateRefreshToken(mockUser as IUser);

    // Try to verify it as an access token
    const result = verifyAccessToken(refreshToken);

    // Should fail due to different secrets
    expect(result).toBeNull();
  });

  it("should detect an access token used with refresh token verification", () => {
    // Generate an access token
    const accessToken = generateAccessToken(mockUser as IUser);

    // Try to verify it as a refresh token
    const result = verifyRefreshToken(accessToken);

    // Should fail due to different secrets
    expect(result).toBeNull();
  });
});
