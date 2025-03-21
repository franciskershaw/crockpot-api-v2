import jwt from 'jsonwebtoken';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyAccessToken, 
  verifyRefreshToken 
} from '../jwt';
import { IUser } from '../../../features/users/user.model';
import mongoose from 'mongoose';

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

describe('JWT Utilities', () => {
  let mockUser: Partial<IUser>;
  let originalEnv: NodeJS.ProcessEnv;
  
  beforeEach(() => {
    // Create a mock user
    mockUser = {
      _id: new mongoose.Types.ObjectId(),
      email: 'test@example.com',
      name: 'Test User',
      role: 'user'
    };
    
    // Save original environment variables
    originalEnv = { ...process.env };
    
    // Set up environment variables for testing
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
    
    // Clear all mock calls
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });
  
  describe('generateAccessToken', () => {
    it('should generate a token with user ID and email', () => {
      // Setup mock return value
      const mockToken = 'mocked-access-token';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      
      // Call the function
      const token = generateAccessToken(mockUser as IUser);
      
      // Assertions
      expect(jwt.sign).toHaveBeenCalledWith(
        { _id: mockUser._id, email: mockUser.email },
        'test-jwt-secret',
        { expiresIn: '30m' }
      );
      expect(token).toBe(mockToken);
    });
    
    it('should throw an error if JWT_SECRET is not defined', () => {
      // Remove JWT_SECRET
      delete process.env.JWT_SECRET;
      
      // Assertions
      expect(() => {
        generateAccessToken(mockUser as IUser);
      }).toThrow('JWT_SECRET is not defined');
      
      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });
  
  describe('generateRefreshToken', () => {
    it('should generate a token with user ID and email', () => {
      // Setup mock return value
      const mockToken = 'mocked-refresh-token';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      
      // Call the function
      const token = generateRefreshToken(mockUser as IUser);
      
      // Assertions
      expect(jwt.sign).toHaveBeenCalledWith(
        { _id: mockUser._id, email: mockUser.email },
        'test-jwt-refresh-secret',
        { expiresIn: '7d' }
      );
      expect(token).toBe(mockToken);
    });
    
    it('should throw an error if JWT_REFRESH_SECRET is not defined', () => {
      // Remove JWT_REFRESH_SECRET
      delete process.env.JWT_REFRESH_SECRET;
      
      // Assertions
      expect(() => {
        generateRefreshToken(mockUser as IUser);
      }).toThrow('JWT_REFRESH_SECRET is not defined');
      
      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });
  
  describe('verifyAccessToken', () => {
    it('should verify a valid token and return the payload', () => {
      // Setup mock payload
      const mockPayload = { _id: mockUser._id, email: mockUser.email };
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
      
      // Call the function
      const result = verifyAccessToken('valid-token');
      
      // Assertions
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-jwt-secret');
      expect(result).toEqual(mockPayload);
    });
    
    it('should return null for an invalid token', () => {
      // Setup mock to throw an error
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      // Call the function
      const result = verifyAccessToken('invalid-token');
      
      // Assertions
      expect(jwt.verify).toHaveBeenCalledWith('invalid-token', 'test-jwt-secret');
      expect(result).toBeNull();
    });
    
    it('should return null if JWT_SECRET is not defined', () => {
      // Remove JWT_SECRET
      delete process.env.JWT_SECRET;
      
      // Call the function
      const result = verifyAccessToken('some-token');
      
      // Assertions
      expect(jwt.verify).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
  
  describe('verifyRefreshToken', () => {
    it('should verify a valid token and return the payload', () => {
      // Setup mock payload
      const mockPayload = { _id: mockUser._id, email: mockUser.email };
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
      
      // Call the function
      const result = verifyRefreshToken('valid-refresh-token');
      
      // Assertions
      expect(jwt.verify).toHaveBeenCalledWith('valid-refresh-token', 'test-jwt-refresh-secret');
      expect(result).toEqual(mockPayload);
    });
    
    it('should return null for an invalid token', () => {
      // Setup mock to throw an error
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      // Call the function
      const result = verifyRefreshToken('invalid-refresh-token');
      
      // Assertions
      expect(jwt.verify).toHaveBeenCalledWith('invalid-refresh-token', 'test-jwt-refresh-secret');
      expect(result).toBeNull();
    });
    
    it('should return null if JWT_REFRESH_SECRET is not defined', () => {
      // Remove JWT_REFRESH_SECRET
      delete process.env.JWT_REFRESH_SECRET;
      
      // Call the function
      const result = verifyRefreshToken('some-refresh-token');
      
      // Assertions
      expect(jwt.verify).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
}); 