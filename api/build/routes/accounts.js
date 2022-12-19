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
const express_1 = require("express");
const zod_1 = require("zod");
const account_1 = __importDefault(require("../controllers/account"));
const authorization_1 = __importDefault(require("../middleware/authorization"));
const error_1 = require("../types/error");
const router = (0, express_1.Router)();
router
  .route("/users/me/account")
  .all(authorization_1.default)
  .get((req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      try {
        const account = yield account_1.default.getAccount(req.userId);
        res.json({
          success: true,
          data: account,
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
          ceiling: zod_1.z
            .number({
              invalid_type_error: "Ceiling must be a number",
            })
            .optional(),
          max_overdraft: zod_1.z
            .number({
              invalid_type_error: "Max overdraft must be a number",
            })
            .optional(),
        });
        const body = bodyValidator.parse(req.body);
        const account = yield account_1.default.updateAccount(req.userId, body);
        res.json({
          success: true,
          data: account,
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
  );
router
  .route("/users/:id/account")
  .all(authorization_1.default)
  .get((req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      try {
        const userId = zod_1.z.string().uuid().parse(req.params.id);
        const account = yield account_1.default.getAccount(userId);
        res.json({
          success: true,
          data: account,
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
  );
router
  .route("/users/me/account/credit-card")
  .all(authorization_1.default)
  .post((req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      try {
        const bodyValidator = zod_1.z.object({
          credit_card: zod_1.z
            .string({
              invalid_type_error: "Credit card number must be a string",
              required_error: "Credit card number is required",
            })
            .regex(
              /^[0-9a-fA-F]+$/,
              "Credit card number must be a hexadecimal string"
            ),
        });
        const parsedBody = bodyValidator.parse(req.body);
        const account = yield account_1.default.addCreditCard(
          req.userId,
          parsedBody.credit_card
        );
        res.json({
          success: true,
          data: account,
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
  );
exports.default = router;
