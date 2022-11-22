import { Router } from "express";
import { PrismaClient, User } from "@prisma/client";
import authorization from "../middleware/authorization";
import { CustomRequest } from "../types/request";
import { CustomResponse } from "../types/response";
import { z, ZodError } from "zod";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const router = Router();

router
  .route("/me")
  .all(authorization)
  .get(async (req: CustomRequest, res: CustomResponse) => {
    if (req.userId) {
      const user = await prisma.user.findUnique({
        where: {
          id: req.userId,
        },
      });

      if (user) {
        return res.json({
          success: true,
          data: {
            id: user.id,
            username: user.username,
            email: user.email,
          },
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
  })
  .patch(async (req: CustomRequest, res: CustomResponse) => {
    if (req.userId) {
      const user = await prisma.user.findUnique({
        where: {
          id: req.userId,
        },
      });

      if (user) {
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
          new_password: z
            .string({
              invalid_type_error: "New password must be a string",
            })
            .min(8, "New password must be at least 8 characters")
            .regex(
              /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
              "New password must contain at least one lowercase letter, one uppercase letter, one number and one special character"
            )
            .optional(),
          confirm_password: z
            .string({
              invalid_type_error: "Password confirmation must be a string",
            })
            .optional(),
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
            return res.status(401).json({
              success: false,
              message: "Incorrect password",
            });
          }

          const data: Partial<User> = {};

          if (body.first_name) {
            data.first_name = body.first_name;
          }

          if (body.last_name) {
            data.last_name = body.last_name;
          }

          if (body.username) {
            data.username = body.username;
          }

          if (body.email) {
            data.email = body.email;
          }

          if (body.new_password) {
            if (!body.confirm_password) {
              return res.status(400).json({
                success: false,
                message: "Password confirmation is required",
              });
            }

            if (body.new_password !== body.confirm_password) {
              return res.status(400).json({
                success: false,
                message: "Passwords do not match",
              });
            }

            data.password = await bcrypt.hash(body.new_password, 10);
          }

          const updatedUser = await prisma.user.update({
            where: {
              id: req.userId,
            },
            data,
          });

          return res.json({
            success: true,
            data: {
              id: updatedUser.id,
              first_name: updatedUser.first_name,
              last_name: updatedUser.last_name,
              username: updatedUser.username,
              email: updatedUser.email,
            },
          });
        } catch (err) {
          if (err instanceof ZodError) {
            return res.status(400).json({
              success: false,
              message: err.issues[0].message,
            });
          } else {
            console.log(err);
            return res.status(500).json({
              success: false,
              message: "Internal server error",
            });
          }
        }
      } else {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
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
            return res.status(401).json({
              success: false,
              message: "Incorrect password",
            });
          }

          await prisma.user.delete({
            where: {
              id: req.userId,
            },
          });

          return res.json({
            success: true,
            message: "User deleted",
          });
        } catch (err) {
          if (err instanceof ZodError) {
            return res.status(400).json({
              success: false,
              message: err.issues[0].message,
            });
          } else {
            console.log(err);
            return res.status(500).json({
              success: false,
              message: "Internal server error",
            });
          }
        }
      } else {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
  });

export default router;
