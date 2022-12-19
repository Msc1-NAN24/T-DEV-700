import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcrypt";
import { Router } from "express";
import { z, ZodError } from "zod";

import userController from "../controllers/user";
import authorization from "../middleware/authorization";
import { CustomError } from "../types/error";
import { CustomRequest } from "../types/request";
import { CustomResponse } from "../types/response";

const prisma = new PrismaClient();

const router = Router();

router
  .route("/users/me")
  .all(authorization)
  .get(async (req: CustomRequest, res: CustomResponse) => {
    try {
      const user = await userController.get(req.userId!);

      res.status(200).json({
        success: true,
        data: {
          user,
        },
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
        first_name: z
          .string({
            invalid_type_error: "First name must be a string",
          })
          .optional(),
        last_name: z
          .string({
            invalid_type_error: "Last name must be a string",
          })
          .optional(),
        username: z
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
        email: z
          .string({
            invalid_type_error: "Email must be a string",
          })
          .email("Invalid email address")
          .optional(),
        password: z.string({
          required_error: "Your current password is required",
          invalid_type_error: "Your current password must be a string",
        }),
      });

      const parsedBody = await bodyValidator.parseAsync(req.body);

      const result = await userController.update(req.userId!, parsedBody);

      res.status(200).json({
        success: true,
        data: {
          user: result,
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
  })
  .delete(async (req: CustomRequest, res: CustomResponse) => {
    if (req.userId) {
      const user = await prisma.user.findUnique({
        where: {
          id: req.userId,
        },
      });

      if (user) {
        const bodyValidator = z.object({
          password: z.string({
            required_error: "Your current password is required",
            invalid_type_error: "Your current password must be a string",
          }),
        });

        try {
          const body = bodyValidator.parse(req.body);

          // Verify current password
          const validPassword = await bcrypt.compare(
            body.password,
            user.password
          );

          if (!validPassword) {
            throw CustomError.badRequest("Invalid password");
          }

          await prisma.user.delete({
            where: {
              id: req.userId,
            },
          });

          res.json({
            success: true,
            error: "User deleted",
          });
        } catch (err) {
          if (err instanceof ZodError) {
            res.status(400).json({
              success: false,
              error: err.message,
            });
          } else if (err instanceof CustomError) {
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
  });

router
  .route("/users/:id")
  .all(authorization)
  .get(async (req: CustomRequest, res: CustomResponse) => {
    try {
      const user = await userController.get(req.params.id);

      res.status(200).json({
        success: true,
        data: {
          user,
        },
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
  });

export default router;
