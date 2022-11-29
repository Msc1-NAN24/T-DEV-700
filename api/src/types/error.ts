export class CustomError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
  }

  static badRequest(message: string = "Bad request") {
    return new CustomError(message, 400);
  }

  static internalServerError(message: string = "Internal server error") {
    return new CustomError(message, 500);
  }

  static notFound(message: string = "Not found") {
    return new CustomError(message, 404);
  }

  static unauthorized(message: string = "Unauthorized") {
    return new CustomError(message, 401);
  }

  static forbidden(message: string = "Forbidden") {
    return new CustomError(message, 403);
  }

  static conflict(message: string = "Conflict") {
    return new CustomError(message, 409);
  }
}
