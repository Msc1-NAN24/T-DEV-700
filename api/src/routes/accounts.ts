import { Router } from "express";
import { z, ZodError } from "zod";

import accountController from "../controllers/account";
import chequeController from "../controllers/cheque";
import authorization from "../middleware/authorization";
import { CustomError } from "../types/error";
import { CustomRequest } from "../types/request";
import { CustomResponse } from "../types/response";

const router = Router();

router
  .route("/users/me/account")
  .all(authorization)
  .get(async (req: CustomRequest, res: CustomResponse) => {
    try {
      const account = await accountController.getAccount(req.userId!);
      res.json({
        success: true,
        data: account,
      });
    } catch (error) {
      if (error instanceof CustomError) {
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
  .patch(async (req: CustomRequest, res: CustomResponse) => {
    try {
      const bodyValidator = z.object({
        ceiling: z
          .number({
            invalid_type_error: "Ceiling must be a number",
          })
          .optional(),
        max_overdraft: z
          .number({
            invalid_type_error: "Max overdraft must be a number",
          })
          .optional(),
      });

      const body = bodyValidator.parse(req.body);

      const account = await accountController.updateAccount(req.userId!, body);

      res.json({
        success: true,
        data: account,
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
  .route("/users/:id/account")
  .all(authorization)
  .get(async (req: CustomRequest, res: CustomResponse) => {
    try {
      const userId = z.string().uuid().parse(req.params.id);

      const account = await accountController.getAccount(userId);
      res.json({
        success: true,
        data: account,
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
  .route("/users/me/account/credit-card")
  .all(authorization)
  .post(async (req: CustomRequest, res: CustomResponse) => {
    try {
      const bodyValidator = z.object({
        credit_card: z
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

      const account = await accountController.addCreditCard(
        req.userId!,
        parsedBody.credit_card
      );
      res.json({
        success: true,
        data: account,
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
  .route("/users/me/account/cheque-uuid")
  .all(authorization)
  .get(async (req: CustomRequest, res: CustomResponse) => {
    try {
      let cheque = await chequeController.getCurrentChequeUuid(req.userId!);

      if (cheque === null) {
        cheque = await chequeController.regenerateCheque(req.userId!);
      }

      res.json({
        success: true,
        data: cheque,
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

export default router;
