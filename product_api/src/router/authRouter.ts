import { Router, Request } from "express";
import crypto from "crypto";
import z from "zod";
import { CustomResponse } from "../types/response";
import AuthService from "../services/authService";
import { create } from "../services/userService";
import prisma from "../client";

const router = Router();
const authService = new AuthService();

router.post("/login", async (req: Request, res: CustomResponse) => {
  try {
    console.log("test");

    const body: { email: string; password: string } = req.body;
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });
    if (!user) throw new Error("Email invalide");

    if (
      user?.password ===
      crypto.createHash("sha256").update(body.password).digest("hex")
    ) {
      return res.status(200).json({
        success: true,
        data: {
          user: user,
          token: authService.generateTokenUser(user),
        },
      });
    } else {
      throw new Error("Mot de passe incorrect");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error as string,
    });
  }
});

router.post("/register", async (req: Request, res: CustomResponse) => {
  const bodyValidator = z.object({
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
  });

  try {
    const body = bodyValidator.parse(req.body);
    const user = await create(body);

    return res.status(201).json({
      success: true,
      data: {
        user: user,
        token: authService.generateTokenUser(user),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error as string,
    });
  }
});

export default router;
