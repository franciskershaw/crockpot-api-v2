import { Schema } from "joi";
import { BadRequestError } from "../errors/errors";

const validateRequest = <T>(payload: unknown, schema: Schema<T>): T => {
  const { value, error } = schema.validate(payload);

  if (error) {
    throw new BadRequestError(error.details[0].message);
  }

  return value as T;
};

export default validateRequest;
