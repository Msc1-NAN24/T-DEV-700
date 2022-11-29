import { Router } from "express";

import accountControlleur from "../controllers/accounts";
import authorization from "../middleware/authorization";
import { CustomError } from "../types/error";
import { CustomRequest } from "../types/request";
import { CustomResponse } from "../types/response";

const router = Router();

router
  .route("/users/me/account")
  .all(authorization)
  .get(async (req: CustomRequest, res: CustomResponse) => {
    try {
      const account = await accountControlleur.getAccount(req.userId!);
      res.json({
        success: true,
        data: account,
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
