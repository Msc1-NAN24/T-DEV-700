"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const error_1 = require("../types/error");
function authorization(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jsonwebtoken_1.default.verify(
      token,
      process.env.JWT_SECRET,
      (err, payload) => {
        if (err) {
          console.log(err);
          throw error_1.CustomError.unauthorized();
        }
        try {
          const payloadValidator = zod_1.z.object({
            userId: zod_1.z.string().uuid(),
            username: zod_1.z.string(),
            admin: zod_1.z.boolean(),
          });
          const parsedPayload = payloadValidator.parse(payload);
          req.userId = parsedPayload.userId;
          req.username = parsedPayload.username;
          req.userAdmin = parsedPayload.admin;
        } catch (error) {
          console.log(error);
          throw error_1.CustomError.unauthorized();
        }
        next();
      }
    );
  } else {
    throw error_1.CustomError.badRequest("Missing authorization header");
  }
}
exports.default = authorization;
