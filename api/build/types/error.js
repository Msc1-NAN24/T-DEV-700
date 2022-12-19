"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = void 0;
class CustomError extends Error {
  constructor(message = "", statusCode) {
    super(message);
    this.statusCode = statusCode;
    // Set the `name` property of the `Error` instance to the name of the `CustomError` class
    this.name = this.constructor.name;
  }
  static badRequest(message = "Bad request") {
    return new CustomError(message, 400);
  }
  static internalServerError(message = "Internal server error") {
    return new CustomError(message, 500);
  }
  static notFound(message = "Not found") {
    return new CustomError(message, 404);
  }
  static unauthorized(message = "Unauthorized") {
    return new CustomError(message, 401);
  }
  static forbidden(message = "Forbidden") {
    return new CustomError(message, 403);
  }
  static conflict(message = "Conflict") {
    return new CustomError(message, 409);
  }
  static databaseError(message = "Database error") {
    return new CustomError(message, 500);
  }
  static credentialsError(message = "Invalid username or password") {
    return new CustomError(message, 401);
  }
}
exports.CustomError = CustomError;
