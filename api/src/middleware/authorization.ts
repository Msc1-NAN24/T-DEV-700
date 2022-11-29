import { NextFunction } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { CustomError } from "../types/error";
import { CustomRequest } from "../types/request";
import { CustomResponse } from "../types/response";

export default function authorization(
  req: CustomRequest,
  res: CustomResponse,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET!, (err, payload) => {
      if (err) {
        console.log(err);
        throw CustomError.unauthorized();
      }

      try {
        const payloadValidator = z.object({
          userId: z.string().uuid(),
          username: z.string(),
          admin: z.boolean(),
        });

        const parsedPayload = payloadValidator.parse(payload);

        req.userId = parsedPayload.userId;
        req.username = parsedPayload.username;
        req.userAdmin = parsedPayload.admin;
      } catch (error) {
        console.log(error);
        throw CustomError.unauthorized();
      }

      next();
    });
  } else {
    throw CustomError.badRequest("Missing authorization header");
  }
}
