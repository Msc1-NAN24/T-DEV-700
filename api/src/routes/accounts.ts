import { Router } from "express";
import { PrismaClient } from "@prisma/client";

import { CustomRequest } from "../types/request";
import { CustomResponse } from "../types/response";
import authorization from "../middleware/authorization";

const prisma = new PrismaClient();
const router = Router();

router
  .route("/users/me/account")
  .all(authorization)
  .get(async (req: CustomRequest, res: CustomResponse) => {
    if (req.userId) {
      try {
        const account =
          (await prisma.account.findUnique({
            where: {
              user_id: req.userId,
            },
          })) ??
          (await prisma.account.create({
            data: {
              user: {
                connect: {
                  id: req.userId,
                },
              },
            },
          }));

        if (account) {
          res.json({
            success: true,
            data: {
              balance: account.balance,
            },
          });
        } else {
          res.status(404).json({
            success: false,
            message: "Account not found",
          });
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    } else {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
  });

export default router;
