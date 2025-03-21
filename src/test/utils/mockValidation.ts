import { BadRequestError } from "../../core/errors/errors";
import { Schema } from "joi";

/**
 * Creates a mock for the validation utility that processes validation results
 * with proper error handling - useful for integration tests.
 */
export function setupValidationMock() {
  return jest.fn((data: any, schema: Schema) => {
    const { error, value } = schema.validate(data);
    if (error) {
      const badRequest = new BadRequestError(error.message);
      (badRequest as any).isJoi = true;
      throw badRequest;
    }
    return value;
  });
}

/**
 * Creates a simplified mock for the validation utility that just returns the data
 * without validation - useful for unit tests where validation isn't the focus.
 */
export function setupSimpleValidationMock() {
  return jest.fn((data) => data);
} 