import * as z from "zod";

export const ProductModel = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  description: z.string(),
  img: z.string(),
});
