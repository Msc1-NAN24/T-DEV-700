import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { Router, Request } from "express";
import UserService from "../services/userService";
import { CustomResponse } from "../types/response";
import { z, ZodError } from "zod";
import crypto from "crypto";
import { User } from "@prisma/client";
import { UserModel } from "../../prisma/zod";

const router = Router();
const userService = new UserService();

router.get("/", async (req: Request, res: CustomResponse) => {
  try {
    const users = await userService.getAll();
    return res.status(200).json({ success: true, data: users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err as string,
    });
  }
});

router.get("/:id", async (req: Request, res: CustomResponse) => {
  try {
    const { id } = req.params;
    const users = await userService.getById(id);
    return res.status(200).json({ success: true, data: users });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError)
      if (err instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: err.issues[0].message ?? "Invalid request",
        });
      } else if (err instanceof PrismaClientKnownRequestError) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      } else {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
  }
});

router.post("/", async (req: Request, res: CustomResponse) => {
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
    const users = await userService.create({
      ...body,
      password: crypto.createHash("sha256").update(body.password).digest("hex"),
    });

    return res.status(201).json({ success: true, data: users });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError)
      if (err instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: err.issues[0].message ?? "Invalid request",
        });
      } else if (err instanceof PrismaClientKnownRequestError) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      } else {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
  }
});

router.patch("/:id", async (req: Request, res: CustomResponse) => {
  const bodyValidator = UserModel.required();
  try {
    const { id } = req.params;
    const body = bodyValidator.parse(req.body);
    const users = await userService.update(id, body as Partial<User>);
    return res.status(200).json({ success: true, data: users });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError)
      if (err instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: err.issues[0].message ?? "Invalid request",
        });
      } else if (err instanceof PrismaClientKnownRequestError) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      } else {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
  }
});

export default router;
