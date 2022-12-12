import { Router, Request } from "express";
import ProductService from "../services/productService";
import { CustomResponse } from "../types/response";
import { z } from "zod";
import authorization from "../middleware/authorize";

const router = Router();
const productService = new ProductService();

router.all("/product", authorization);
router.get("/:id", async (req: Request, res: CustomResponse) => {
  try {
    const { id } = req.params;
    const product = await productService.getById(id);
    if (product) {
      return res.status(200).json({
        success: true,
        data: product,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: `Product ${id} not found`,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Error",
    });
  }
});

router.get("/", async (req: Request, res: CustomResponse) => {
  try {
    const products = await productService.getAll();

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Error",
    });
  }
});

router.post("/", async (req: Request, res: CustomResponse) => {
  const bodyValidator = z.object({
    name: z.string(),
    price: z.number(),
    description: z.string(),
    img: z.string(),
  });
  try {
    const body = bodyValidator.parse(req.body);
    const product = await productService.create(body);

    return res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Error",
    });
  }
});

router.patch("/:id", async (req: Request, res: CustomResponse) => {
  const bodyValidator = z.object({
    name: z.string().optional(),
    price: z.number().optional(),
    description: z.string().optional(),
    img: z.string().optional(),
  });

  try {
    const { id } = req.params;
    const body = bodyValidator.parse(req.body);
    const product = productService.update(id, body);
    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Error",
    });
  }
});
router.delete("/:id", async (req: Request, res: CustomResponse) => {
  try {
    const { id } = req.params;
    const product = await productService.deleteProduct(id);
    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Error",
    });
  }
});

export default router;
