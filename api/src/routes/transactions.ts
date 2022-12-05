import { Router } from "express";
import { PrismaClient, TransactionStatus } from "@prisma/client";

import { CustomRequest } from "../types/request";
import { CustomResponse } from "../types/response";
import authorization from "../middleware/authorization";
import { CustomError } from "../types/error";
import transactionController from "../controllers/transactions";
import { z, ZodError } from "zod";

const prisma = new PrismaClient();
const router = Router();

router
  .route("/users/:id/pay")
  .all(authorization)
  .post(async (req: CustomRequest, res: CustomResponse) => {
    try {
      const bodyValidator = z.object({
        amount: z
          .number({
            required_error: "Amount is required",
            invalid_type_error: "Amount must be a number",
          })
          .int("Amount must be an integer")
          .positive("Amount must be a positive number"),
      });

      const parsedBody = await bodyValidator.parseAsync(req.body);

      await transactionController.pay({
        amount: parsedBody.amount,
        recipientId: req.params.id,
        senderId: req.userId!,
      });

      res.status(201).json({
        success: true,
        data: {
          message: "Transaction successful",
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: error.issues[0].message,
        });
      } else if (error instanceof CustomError) {
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
  });

router
  .route("/users/:id/charge")
  .all(authorization)
  .post(async (req: CustomRequest, res: CustomResponse) => {
    try {
      const bodyValidator = z.object({
        amount: z
          .number({
            required_error: "Amount is required",
            invalid_type_error: "Amount must be a number",
          })
          .int("Amount must be an integer")
          .positive("Amount must be a positive number"),
      });

      const parsedBody = await bodyValidator.parseAsync(req.body);

      await transactionController.pay({
        amount: parsedBody.amount,
        recipientId: req.userId!,
        senderId: req.params.id,
      });

      res.status(201).json({
        success: true,
        data: {
          message: "Transaction successful",
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: error.issues[0].message,
        });
      } else if (error instanceof CustomError) {
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
  });

router
  .route("/users/me/transactions")
  .all(authorization)
  .get(async (req: CustomRequest, res: CustomResponse) => {
    try {
      const queryValidator = z.object({
        limit: z
          .number({
            invalid_type_error: "Limit must be a number",
          })
          .int("Limit must be an integer")
          .default(10),
        offset: z
          .number({
            invalid_type_error: "Offset must be a number",
          })
          .int("Offset must be an integer")
          .default(0),
        status: z
          .string({
            required_error: "Status is required",
            invalid_type_error: "Status must be a string",
          })
          .refine((value) => {
            return value in TransactionStatus;
          })
          .transform((value) => {
            return value as TransactionStatus;
          })
          .optional(),
      });

      const parsedQuery = await queryValidator.parseAsync(req.query);

      const transactions = await transactionController.getTransactions({
        limit: parsedQuery.limit,
        offset: parsedQuery.offset,
        status: parsedQuery.status,
        userId: req.userId!,
      });

      res.json({
        success: true,
        data: {
          transactions,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: error.issues[0].message,
        });
      } else if (error instanceof CustomError) {
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
  });

router.get(
  "/users/:id/transactions",
  authorization,
  async (req: CustomRequest, res: CustomResponse) => {
    try {
      const queryValidator = z.object({
        limit: z
          .number({
            invalid_type_error: "Limit must be a number",
          })
          .int("Limit must be an integer")
          .default(10),
        offset: z
          .number({
            invalid_type_error: "Offset must be a number",
          })
          .int("Offset must be an integer")
          .default(0),
        status: z
          .string({
            required_error: "Status is required",
            invalid_type_error: "Status must be a string",
          })
          .refine((value) => {
            return value in TransactionStatus;
          })
          .transform((value) => {
            return value as TransactionStatus;
          })
          .optional(),
      });

      const parsedQuery = await queryValidator.parseAsync(req.query);

      const transactions = await transactionController.getTransactions({
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
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: error.issues[0].message,
        });
      } else if (error instanceof CustomError) {
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
  }
);

export default router;
