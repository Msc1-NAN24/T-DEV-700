import { Router, Request } from "express";
import ProductService from "../services/productService";
import { CustomResponse } from "../types/response";
import { z } from "zod";
import OrderService from "../services/orderService";

const router = Router();
const orderService = new OrderService();

router.get("/", (req: Request, res: CustomResponse) => {});

router.post("/", async (req: Request, res: CustomResponse) => {
  // const validatorBody = z.object({})
  try {
    const body = req.body;
    const order = await orderService.create(body);
    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    console.error(err);
    return res.status(200).json({
      success: true,
      message: err as string,
    });
  }
});

export default router;
