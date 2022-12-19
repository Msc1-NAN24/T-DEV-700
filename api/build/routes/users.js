"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const express_1 = require("express");
const zod_1 = require("zod");
const user_1 = __importDefault(require("../controllers/user"));
const authorization_1 = __importDefault(require("../middleware/authorization"));
const error_1 = require("../types/error");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
router
  .route("/users/me")
  .all(authorization_1.default)
  .get((req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      try {
        const user = yield user_1.default.get(req.userId);
        res.status(200).json({
          success: true,
          data: {
            user,
          },
        });
      } catch (error) {
        if (error instanceof error_1.CustomError) {
          res.status(error.statusCode).json({
            success: false,
            error: error.message,
          });
        } else {
          res.status(500).json({
            success: false,
            error: "Internal server error",
          });
        }
      }
    })
  )
  .patch((req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      try {
        const bodyValidator = zod_1.z.object({
          first_name: zod_1.z
            .string({
              invalid_type_error: "First name must be a string",
            })
            .optional(),
          last_name: zod_1.z
            .string({
              invalid_type_error: "Last name must be a string",
            })
            .optional(),
          username: zod_1.z
            .string({
              invalid_type_error: "Username must be a string",
            })
            .min(3, "Username must be at least 3 characters long")
            .max(16, "Username must be at most 16 characters long")
            .regex(
              /^[a-zA-Z0-9_]+$/,
              "Username must only contain letters, numbers, and underscores"
            )
            .optional(),
          email: zod_1.z
            .string({
              invalid_type_error: "Email must be a string",
            })
            .email("Invalid email address")
            .optional(),
          password: zod_1.z.string({
            required_error: "Your current password is required",
            invalid_type_error: "Your current password must be a string",
          }),
        });
        const parsedBody = yield bodyValidator.parseAsync(req.body);
        const result = yield user_1.default.update(req.userId, parsedBody);
        res.status(200).json({
          success: true,
          data: {
            user: result,
          },
        });
      } catch (error) {
        if (error instanceof zod_1.ZodError) {
          res.status(400).json({
            success: false,
            error: error.issues[0].message,
          });
        } else if (error instanceof error_1.CustomError) {
          res.status(error.statusCode).json({
            success: false,
            error: error.message,
          });
        } else {
          res.status(500).json({
            success: false,
            error: "Internal server error",
          });
        }
      }
    })
  )
  .delete((req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      if (req.userId) {
        const user = yield prisma.user.findUnique({
          where: {
            id: req.userId,
          },
        });
        if (user) {
          const bodyValidator = zod_1.z.object({
            password: zod_1.z.string({
              required_error: "Your current password is required",
              invalid_type_error: "Your current password must be a string",
            }),
          });
          try {
            const body = bodyValidator.parse(req.body);
            // Verify current password
            const validPassword = yield bcrypt_1.default.compare(
              body.password,
              user.password
            );
            if (!validPassword) {
              throw error_1.CustomError.badRequest("Invalid password");
            }
            yield prisma.user.delete({
              where: {
                id: req.userId,
              },
            });
            res.json({
              success: true,
              error: "User deleted",
            });
          } catch (err) {
            if (err instanceof zod_1.ZodError) {
              res.status(400).json({
                success: false,
                error: err.message,
              });
            } else if (err instanceof error_1.CustomError) {
              res.status(err.statusCode).json({
                success: false,
                error: err.message,
              });
            } else {
              res.status(500).json({
                success: false,
                error: "Internal server error",
              });
            }
          }
        } else {
          res.status(404).json({
            success: false,
            error: "User not found",
          });
        }
      } else {
        res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
      }
    })
  );
router
  .route("/users/:id")
  .all(authorization_1.default)
  .get((req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      try {
        const user = yield user_1.default.get(req.params.id);
        res.status(200).json({
          success: true,
          data: {
            user,
          },
        });
      } catch (error) {
        if (error instanceof error_1.CustomError) {
          res.status(error.statusCode).json({
            success: false,
            error: error.message,
          });
        } else {
          res.status(500).json({
            success: false,
            error: "Internal server error",
          });
        }
      }
    })
  );
exports.default = router;
