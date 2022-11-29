import { Request, Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z, ZodError } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { CustomResponse } from "../types/response";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { CustomError } from "../types/error";
import authController from "../controllers/authentication";

const prisma = new PrismaClient();

const router = Router();

router.post("/register", async (req: Request, res: CustomResponse) => {
  try {
    const bodyValidator = z.object({
      first_name: z
        .string({
          required_error: "First name is required",
          invalid_type_error: "First name must be a string",
        })
        .min(1, "First name must be at least 1 character long"),
      last_name: z
        .string({
          required_error: "Last name is required",
          invalid_type_error: "Last name must be a string",
        })
        .min(1, "Last name must be at least 1 character long"),
      // Custom error message for regex validation
      username: z
        .string({
          required_error: "Username is required",
          invalid_type_error: "Username must be a string",
        })
        .regex(
          /^[a-zA-Z0-9_]{3,16}$/,
          "Username must be between 3 and 16 characters and can only contain letters, numbers and underscores"
        ),
      email: z
        .string({
          required_error: "Email is required",
          invalid_type_error: "Email must be a string",
        })
        .email("Invalid email address"),
      password: z
        .string({
          required_error: "Password is required",
          invalid_type_error: "Password must be a string",
        })
        .min(8, "Password must be at least 8 characters")
        .regex(
          /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
          "Password must contain at least one lowercase letter, one uppercase letter, one number and one special character"
        ),
      confirm_password: z.string({
        required_error: "Password confirmation is required",
        invalid_type_error: "Password confirmation must be a string",
      }),
    });

    const parsedBody = bodyValidator.parse(req.body);

    const token = await authController.register(parsedBody);

    res.status(200).json({
      success: true,
      data: {
        token,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: error.issues[0].message,
      });
    } else if (error instanceof PrismaClientKnownRequestError) {
      res.status(400).json({
        success: false,
        error: error.message,
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

router.post("/login", async (req: Request, res: CustomResponse) => {
  try {
    const bodyValidator = z.object({
      username: z
        .string({
          required_error: "Username is required",
          invalid_type_error: "Username must be a string",
        })
        .min(1, "Username must be at least 1 character long"),
      password: z
        .string({
          required_error: "Password is required",
          invalid_type_error: "Password must be a string",
        })
        .min(8, "Password must be at least 8 characters"),
    });

    const parsedBody = bodyValidator.parse(req.body);

    const token = await authController.login(parsedBody);

    res.status(200).json({
      success: true,
      data: {
        token,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: error.issues[0].message,
      });
    } else if (error instanceof PrismaClientKnownRequestError) {
      res.status(400).json({
        success: false,
        error: error.message,
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
