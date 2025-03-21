import { registerSchema, loginSchema } from "../auth.validation";

describe("Auth Validation Schemas", () => {
  describe("Register Schema", () => {
    it("should validate a correct registration payload", () => {
      const validPayload = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      const { error } = registerSchema.validate(validPayload);
      expect(error).toBeUndefined();
    });

    it("should reject a payload with invalid email", () => {
      const invalidPayload = {
        email: "not-an-email",
        password: "password123",
        name: "Test User",
      };

      const { error } = registerSchema.validate(invalidPayload);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain("valid email");
    });

    it("should reject a payload with short password", () => {
      const invalidPayload = {
        email: "test@example.com",
        password: "pass",
        name: "Test User",
      };

      const { error } = registerSchema.validate(invalidPayload);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain("at least 6 characters");
    });

    it("should reject a payload with missing name", () => {
      const invalidPayload = {
        email: "test@example.com",
        password: "password123",
      };

      const { error } = registerSchema.validate(invalidPayload);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain("required");
    });
  });

  describe("Login Schema", () => {
    it("should validate a correct login payload", () => {
      const validPayload = {
        email: "test@example.com",
        password: "password123",
      };

      const { error } = loginSchema.validate(validPayload);
      expect(error).toBeUndefined();
    });

    it("should reject a payload with invalid email", () => {
      const invalidPayload = {
        email: "not-an-email",
        password: "password123",
      };

      const { error } = loginSchema.validate(invalidPayload);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain("valid email");
    });

    it("should reject a payload with missing password", () => {
      const invalidPayload = {
        email: "test@example.com",
      };

      const { error } = loginSchema.validate(invalidPayload);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain("required");
    });
  });
});
