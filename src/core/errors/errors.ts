export class BadRequestError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = 400;
  }
}

export class UnauthorizedError extends Error {
  statusCode: number;
  errorCode?: string | number;

  constructor(message: string, errorCode?: string | number) {
    super(message);
    this.statusCode = 401;
    this.errorCode = errorCode;
  }
}

export class NotFoundError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = 404;
  }
}

export class ForbiddenError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = 403;
  }
}

export class ConflictError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = 409;
  }
}

export class InternalServerError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = 500;
  }
}

export class ServiceUnavailableError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = 503;
  }
}
