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
const runtime_1 = require("@prisma/client/runtime");
const express_1 = require("express");
const zod_1 = require("zod");
const authentication_1 = __importDefault(
  require("../controllers/authentication")
);
const error_1 = require("../types/error");
const router = (0, express_1.Router)();
router.post("/register", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const bodyValidator = zod_1.z.object({
        first_name: zod_1.z
          .string({
            required_error: "First name is required",
            invalid_type_error: "First name must be a string",
          })
          .min(1, "First name must be at least 1 character long"),
        last_name: zod_1.z
          .string({
            required_error: "Last name is required",
            invalid_type_error: "Last name must be a string",
          })
          .min(1, "Last name must be at least 1 character long"),
        username: zod_1.z
          .string({
            required_error: "Username is required",
            invalid_type_error: "Username must be a string",
          })
          .regex(
            /^[a-zA-Z0-9_]{3,16}$/,
            "Username must be between 3 and 16 characters and can only contain letters, numbers and underscores"
          ),
        email: zod_1.z
          .string({
            required_error: "Email is required",
            invalid_type_error: "Email must be a string",
          })
          .email("Invalid email address"),
        password: zod_1.z
          .string({
            required_error: "Password is required",
            invalid_type_error: "Password must be a string",
          })
          .min(8, "Password must be at least 8 characters")
          .regex(
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
            "Password must contain at least one lowercase letter, one uppercase letter, one number and one special character"
          ),
        confirm_password: zod_1.z.string({
          required_error: "Password confirmation is required",
          invalid_type_error: "Password confirmation must be a string",
        }),
      });
      const parsedBody = bodyValidator.parse(req.body);
      const token = yield authentication_1.default.register(parsedBody);
      res.status(200).json({
        success: true,
        data: {
          token,
        },
      });
    } catch (error) {
      if (error instanceof zod_1.ZodError) {
        res.status(400).json({
          success: false,
          error: error.issues[0].message,
        });
      } else if (error instanceof runtime_1.PrismaClientKnownRequestError) {
        res.status(400).json({
          success: false,
          error: error.message,
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
);
router.post("/login", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const bodyValidator = zod_1.z.object({
        username: zod_1.z
          .string({
            required_error: "Username is required",
            invalid_type_error: "Username must be a string",
          })
          .min(1, "Username must be at least 1 character long"),
        password: zod_1.z
          .string({
            required_error: "Password is required",
            invalid_type_error: "Password must be a string",
          })
          .min(8, "Password must be at least 8 characters"),
      });
      const parsedBody = bodyValidator.parse(req.body);
      const token = yield authentication_1.default.login(parsedBody);
      res.status(200).json({
        success: true,
        data: {
          token,
        },
      });
    } catch (error) {
      if (error instanceof zod_1.ZodError) {
        res.status(400).json({
          success: false,
          error: error.issues[0].message,
        });
      } else if (error instanceof runtime_1.PrismaClientKnownRequestError) {
        res.status(400).json({
          success: false,
          error: error.message,
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
);
exports.default = router;
