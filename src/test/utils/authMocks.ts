import { IUser } from "../../features/users/user.model";
import mongoose from "mongoose";

/**
 * Sets up a mock for passport authentication
 * @param successEmail - When this email is used in a request, authentication will succeed
 * @param successPassword - When this password is used with successEmail, authentication will succeed
 */
export function setupPassportMock(
  successEmail = "test@example.com", 
  successPassword = "password123"
) {
  return {
    authenticate: jest.fn((strategy, options) => {
      return (req: any, res: any, next: any) => {
        if (strategy === "local") {
          // Simulate local authentication
          const { email, password } = req.body;

          // For successful authentication test
          if (email === successEmail && password === successPassword) {
            req.user = {
              _id: "mockuserid",
              email,
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
  };
}

/**
 * Sets up mocks for JWT utilities
 */
export function setupJwtMock() {
  return {
    verifyAccessToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
    generateAccessToken: jest.fn().mockReturnValue("mocked_access_token"),
    generateRefreshToken: jest.fn().mockReturnValue("mocked_refresh_token"),
  };
}

/**
 * Sets up a User.findById mock that properly handles the lean() method
 */
export function setupUserFindByIdMock() {
  return jest.fn().mockImplementation((id) => {
    return {
      lean: jest.fn().mockReturnValue({
        _id: id,
        email: "test@example.com",
        name: "Test User",
        role: "user",
        provider: "local",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    };
  });
}

/**
 * Creates a sample user object for testing
 */
export function createTestUserObject(overrides = {}): Partial<IUser> {
  return {
    _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
    email: "test@example.com",
    name: "Test User",
    role: "user",
    provider: "local",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
} 