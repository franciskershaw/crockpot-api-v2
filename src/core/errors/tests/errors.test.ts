import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
  InternalServerError,
  ServiceUnavailableError,
} from "../errors";

describe("Error Classes", () => {
  describe("BadRequestError", () => {
    it("should create an instance with correct properties", () => {
      const errorMessage = "Invalid input";
      const error = new BadRequestError(errorMessage);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(BadRequestError);
      expect(error.message).toBe(errorMessage);
      expect(error.statusCode).toBe(400);
    });
  });

  describe("UnauthorizedError", () => {
    it("should create an instance with correct properties", () => {
      const errorMessage = "Not authenticated";
      const error = new UnauthorizedError(errorMessage);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(UnauthorizedError);
      expect(error.message).toBe(errorMessage);
      expect(error.statusCode).toBe(401);
      expect(error.errorCode).toBeUndefined();
    });

    it("should handle optional errorCode parameter", () => {
      const errorMessage = "Token expired";
      const errorCode = "TOKEN_EXPIRED";
      const error = new UnauthorizedError(errorMessage, errorCode);

      expect(error.message).toBe(errorMessage);
      expect(error.statusCode).toBe(401);
      expect(error.errorCode).toBe(errorCode);
    });
  });

  describe("NotFoundError", () => {
    it("should create an instance with correct properties", () => {
      const errorMessage = "Resource not found";
      const error = new NotFoundError(errorMessage);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toBe(errorMessage);
      expect(error.statusCode).toBe(404);
    });
  });

  describe("ForbiddenError", () => {
    it("should create an instance with correct properties", () => {
      const errorMessage = "Access denied";
      const error = new ForbiddenError(errorMessage);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ForbiddenError);
      expect(error.message).toBe(errorMessage);
      expect(error.statusCode).toBe(403);
    });
  });

  describe("ConflictError", () => {
    it("should create an instance with correct properties", () => {
      const errorMessage = "Resource already exists";
      const error = new ConflictError(errorMessage);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ConflictError);
      expect(error.message).toBe(errorMessage);
      expect(error.statusCode).toBe(409);
    });
  });

  describe("InternalServerError", () => {
    it("should create an instance with correct properties", () => {
      const errorMessage = "Something went wrong";
      const error = new InternalServerError(errorMessage);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(InternalServerError);
      expect(error.message).toBe(errorMessage);
      expect(error.statusCode).toBe(500);
    });
  });

  describe("ServiceUnavailableError", () => {
    it("should create an instance with correct properties", () => {
      const errorMessage = "Service is currently unavailable";
      const error = new ServiceUnavailableError(errorMessage);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ServiceUnavailableError);
      expect(error.message).toBe(errorMessage);
      expect(error.statusCode).toBe(503);
    });
  });
});
