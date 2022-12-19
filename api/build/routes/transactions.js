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
const express_1 = require("express");
const zod_1 = require("zod");
const transactions_1 = __importDefault(require("../controllers/transactions"));
const authorization_1 = __importDefault(require("../middleware/authorization"));
const error_1 = require("../types/error");
const router = (0, express_1.Router)();
router
  .route("/users/:id/pay")
  .all(authorization_1.default)
  .post((req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      try {
        const bodyValidator = zod_1.z.object({
          amount: zod_1.z
            .number({
              required_error: "Amount is required",
              invalid_type_error: "Amount must be a number",
            })
            .int("Amount must be an integer")
            .positive("Amount must be a positive number"),
        });
        const parsedBody = yield bodyValidator.parseAsync(req.body);
        yield transactions_1.default.pay({
          amount: parsedBody.amount,
          recipientId: req.params.id,
          senderId: req.userId,
        });
        res.status(201).json({
          success: true,
          data: {
            message: "Transaction successful",
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
  );
router
  .route("/users/:id/charge")
  .all(authorization_1.default)
  .post((req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      try {
        const bodyValidator = zod_1.z.object({
          amount: zod_1.z
            .number({
              required_error: "Amount is required",
              invalid_type_error: "Amount must be a number",
            })
            .int("Amount must be an integer")
            .positive("Amount must be a positive number"),
        });
        const parsedBody = yield bodyValidator.parseAsync(req.body);
        yield transactions_1.default.pay({
          amount: parsedBody.amount,
          recipientId: req.userId,
          senderId: req.params.id,
        });
        res.status(201).json({
          success: true,
          data: {
            message: "Transaction successful",
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
  );
router
  .route("/credit-card/:id/charge")
  .all(authorization_1.default)
  .post((req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      try {
        const bodyValidator = zod_1.z.object({
          amount: zod_1.z
            .number({
              required_error: "Amount is required",
              invalid_type_error: "Amount must be a number",
            })
            .int("Amount must be an integer")
            .positive("Amount must be a positive number"),
        });
        const parsedBody = yield bodyValidator.parseAsync(req.body);
        yield transactions_1.default.creditCardTransaction({
          amount: parsedBody.amount,
          creditCardId: req.params.id,
          recipientId: req.userId,
        });
        res.status(201).json({
          success: true,
          data: {
            message: "Transaction successful",
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
  );
router
  .route("/users/me/transactions")
  .all(authorization_1.default)
  .get((req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      try {
        const queryValidator = zod_1.z.object({
          limit: zod_1.z
            .number({
              invalid_type_error: "Limit must be a number",
            })
            .int("Limit must be an integer")
            .default(10),
          offset: zod_1.z
            .number({
              invalid_type_error: "Offset must be a number",
            })
            .int("Offset must be an integer")
            .default(0),
          status: zod_1.z
            .string({
              required_error: "Status is required",
              invalid_type_error: "Status must be a string",
            })
            .refine((value) => {
              return value in client_1.TransactionStatus;
            })
            .transform((value) => {
              return value;
            })
            .optional(),
        });
        const parsedQuery = yield queryValidator.parseAsync(req.query);
        const transactions = yield transactions_1.default.getTransactions({
          limit: parsedQuery.limit,
          offset: parsedQuery.offset,
          status: parsedQuery.status,
          userId: req.userId,
        });
        res.json({
          success: true,
          data: {
            transactions,
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
  );
router.get("/users/:id/transactions", authorization_1.default, (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const queryValidator = zod_1.z.object({
        limit: zod_1.z
          .number({
            invalid_type_error: "Limit must be a number",
          })
          .int("Limit must be an integer")
          .default(10),
        offset: zod_1.z
          .number({
            invalid_type_error: "Offset must be a number",
          })
          .int("Offset must be an integer")
          .default(0),
        status: zod_1.z
          .string({
            required_error: "Status is required",
            invalid_type_error: "Status must be a string",
          })
          .refine((value) => {
            return value in client_1.TransactionStatus;
          })
          .transform((value) => {
            return value;
          })
          .optional(),
      });
      const parsedQuery = yield queryValidator.parseAsync(req.query);
      const transactions = yield transactions_1.default.getTransactions({
        limit: parsedQuery.limit,
        offset: parsedQuery.offset,
        status: parsedQuery.status,
        userId: req.params.id,
      });
      res.json({
        success: true,
        data: {
          transactions,
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
);
exports.default = router;
