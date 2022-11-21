import { PrismaClient } from "@prisma/client";
import { Request, Router } from "express";
import { z, ZodError } from "zod";
import crypto from "crypto";
import { CustomResponse } from "../types/response";

const prisma = new PrismaClient();

const router = Router();

router.post("/register", async (req: Request, res: CustomResponse) => {
  const bodyValidator = z.object({
    first_name: z.string(),
    last_name: z.string(),
    username: z.string(),
    email: z.string().email(),
    password: z.string(),
    confirm_password: z.string(),
  });

  try {
    const body = bodyValidator.parse(req.body);
    res.status(200).json({
      success: true,
      data: body,
    });
  } catch (err) {
    console.error(err);
    if (err instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: "Invalid request body",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Something went wrong",
      });
    }
  }
});

export default router;
