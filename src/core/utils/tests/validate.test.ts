import Joi from "joi";
import validateRequest from "../validate";
import { BadRequestError } from "../../errors/errors";

describe("Validation Utility", () => {
  describe("validateRequest", () => {
    // Test case for successful validation
    it("should return validated value when schema is valid", () => {
      // Define a simple schema
      const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        age: Joi.number().min(18).required(),
      });

      // Valid payload
      const payload = {
        name: "John Doe",
        email: "john@example.com",
        age: 25,
      };

      // Validate
      const result = validateRequest(payload, schema);

      // Assertions
      expect(result).toEqual(payload);
    });

    // Test case for failed validation
    it("should throw BadRequestError when validation fails", () => {
      // Define a schema
      const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        age: Joi.number().min(18).required(),
      });

      // Invalid payload (missing required field)
      const payload = {
        name: "John Doe",
        email: "john@example.com",
        // age is missing
      };

      // Assertion
      expect(() => {
        validateRequest(payload, schema);
      }).toThrow(BadRequestError);
    });

    // Test case for specific error message
    it("should include the validation error message in the thrown error", () => {
      // Define a schema
      const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        age: Joi.number().min(18).required(),
      });

      // Invalid payload (missing required field)
      const payload = {
        name: "John Doe",
        email: "john@example.com",
        // age is missing
      };

      // Assertion
      try {
        validateRequest(payload, schema);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        if (error instanceof BadRequestError) {
          expect(error.message).toContain('"age" is required');
        } else {
          throw new Error(
            "Expected error to be an instance of BadRequestError"
          );
        }
      }
    });

    // Test with invalid email
    it("should throw BadRequestError when email format is invalid", () => {
      // Define a schema
      const schema = Joi.object({
        email: Joi.string().email().required(),
      });

      // Invalid payload (invalid email format)
      const payload = {
        email: "not-an-email",
      };

      // Assertion
      try {
        validateRequest(payload, schema);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        if (error instanceof BadRequestError) {
          expect(error.message).toContain("must be a valid email");
        } else {
          throw new Error(
            "Expected error to be an instance of BadRequestError"
          );
        }
      }
    });

    // Test with string schema
    it("should validate simple string schema", () => {
      // Define a simple string schema
      const schema = Joi.string().min(3).max(10);

      // Valid string
      const validString = "Hello";
      const result = validateRequest(validString, schema);
      expect(result).toBe(validString);

      // Invalid string (too short)
      const tooShortString = "Hi";
      expect(() => {
        validateRequest(tooShortString, schema);
      }).toThrow(BadRequestError);

      // Invalid string (too long)
      const tooLongString = "HelloWorldTooLong";
      expect(() => {
        validateRequest(tooLongString, schema);
      }).toThrow(BadRequestError);
    });

    // Test with array schema
    it("should validate array schema", () => {
      // Define an array schema
      const schema = Joi.array().items(Joi.string()).min(1).required();

      // Valid array
      const validArray = ["item1", "item2"];
      const result = validateRequest(validArray, schema);
      expect(result).toEqual(validArray);

      // Invalid array (empty)
      const emptyArray: string[] = [];
      expect(() => {
        validateRequest(emptyArray, schema);
      }).toThrow(BadRequestError);

      // Invalid array (wrong type)
      const wrongTypeArray = [1, 2, 3];
      expect(() => {
        validateRequest(wrongTypeArray, schema);
      }).toThrow(BadRequestError);
    });
  });
});
