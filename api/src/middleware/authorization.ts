import { NextFunction } from "express";
import jwt from "jsonwebtoken";
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
    jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
      if (err) {
        console.log(err);

        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }
      req.userId = (user as any).userId;
      req.username = (user as any).username;
      next();
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Missing authorization header",
    });
  }
}
