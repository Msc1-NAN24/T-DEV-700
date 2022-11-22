import { Router, Request } from "express";
import { PrismaClient } from "@prisma/client";
import { z, ZodError } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { CustomResponse } from "../types/response";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

const prisma = new PrismaClient();

const router = Router();

router.post("/register", async (req: Request, res: CustomResponse) => {
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

  try {
    const {
      first_name,
      last_name,
      username,
      email,
      password,
      confirm_password,
    } = bodyValidator.parse(req.body);

    if (password !== confirm_password) {
      res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const user = await prisma.user.create({
      data: {
        first_name,
        last_name,
        username,
        email,
        password: await bcrypt.hash(password, 10),
        account: {
          create: {},
        },
      },
    });

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        admin: user.is_admin,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      }
    );

    res.status(201).json({
      success: true,
      data: { token },
    });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: err.issues[0].message ?? "Invalid request",
      });
    } else if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        res.status(409).json({
          success: false,
          message: "Username or email already exists",
        });
      } else {
        console.error(err);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    } else {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
});

router.post("/login", async (req: Request, res: CustomResponse) => {
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

  try {
    const body = bodyValidator.parse(req.body);

    const user = await prisma.user.findUnique({
      where: {
        username: body.username,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const hashedPassword = user.password;

    if (user.password !== hashedPassword) {
      res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        admin: user.is_admin,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      success: true,
      data: {
        token,
      },
    });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: err.issues[0].message ?? "Invalid request",
      });
    } else if (err instanceof PrismaClientKnownRequestError) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    } else {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
});

export default router;
