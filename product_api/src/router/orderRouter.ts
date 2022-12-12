import { Router, Request } from "express";
import { CustomResponse } from "../types/response";
import OrderService from "../services/orderService";
import authorization from "../middleware/authorize";

const router = Router();
const orderService = new OrderService();

router.all("order", authorization);
router.get("/", async (req: Request, res: CustomResponse) => {
  try {
    const order = await orderService.getAllOrder();
    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: true,
      message: err as string,
    });
  }
});

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
    return res.status(500).json({
      success: true,
      message: err as string,
    });
  }
});

router.get("/:id", async (req: Request, res: CustomResponse) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
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

router.get("/user/:id", async (req: Request, res: CustomResponse) => {
  try {
    const order = await orderService.getOrderByUserID(req.params.id);
    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: true,
      message: err as string,
    });
  }
});

export default router;
