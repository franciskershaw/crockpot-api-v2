import { jest } from '@jest/globals';

// Setup mocks before importing the modules
const mockCloudinaryConfig = jest.fn();
const mockCloudinaryStorage = jest.fn();

// Mock cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    config: mockCloudinaryConfig,
  },
}));

// Mock CloudinaryStorage
jest.mock('multer-storage-cloudinary', () => ({
  CloudinaryStorage: jest.fn().mockImplementation((options) => {
    mockCloudinaryStorage(options);
    return {};
  }),
}));

describe('Cloudinary Configuration', () => {
  // Save original environment and reset mocks before each test
  let originalEnv: NodeJS.ProcessEnv;
  
  beforeEach(() => {
    originalEnv = { ...process.env };
    jest.resetModules();
    jest.clearAllMocks();
  });
  
  // Restore environment after each test
  afterEach(() => {
    process.env = originalEnv;
  });

  it('should configure cloudinary with environment variables', () => {
    // Set up test environment variables
    process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
    process.env.CLOUDINARY_KEY = 'test-key';
    process.env.CLOUDINARY_SECRET = 'test-secret';
    
    // Import the module to trigger configuration
    require('../cloudinary');
    
    // Verify cloudinary was configured with correct values
    expect(mockCloudinaryConfig).toHaveBeenCalledWith({
      cloud_name: 'test-cloud',
      api_key: 'test-key',
      api_secret: 'test-secret',
    });
  });

  it('should create CloudinaryStorage with correct parameters', () => {
    // Set up test environment variables
    process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
    process.env.CLOUDINARY_KEY = 'test-key';
    process.env.CLOUDINARY_SECRET = 'test-secret';
    
    // Import the module to trigger configuration
    require('../cloudinary');
    
    // Verify CloudinaryStorage was initialized with correct options
    expect(mockCloudinaryStorage).toHaveBeenCalledWith(
      expect.objectContaining({
        params: {
          folder: 'Crockpot',
          allowedFormats: ['jpeg', 'jpg', 'png', 'svg'],
        }
      })
    );
  });

  it('should handle missing environment variables', () => {
    // Don't set required env variables to simulate missing config
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_KEY;
    delete process.env.CLOUDINARY_SECRET;
    
    // Import should still work without errors
    const importModule = () => require('../cloudinary');
    
    // The import shouldn't throw, as the config would just use undefined values
    expect(importModule).not.toThrow();
    
    // Cloudinary config should be called with undefined values
    importModule();
    expect(mockCloudinaryConfig).toHaveBeenCalledWith({
      cloud_name: undefined,
      api_key: undefined,
      api_secret: undefined,
    });
  });

  it('should export cloudinary and storage', () => {
    // Set up test environment variables
    process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
    process.env.CLOUDINARY_KEY = 'test-key';
    process.env.CLOUDINARY_SECRET = 'test-secret';
    
    // Import the module
    const cloudinaryModule = require('../cloudinary');
    
    // Verify exports exist
    expect(cloudinaryModule.cloudinary).toBeDefined();
    expect(cloudinaryModule.storage).toBeDefined();
  });
}); 