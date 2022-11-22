import * as z from "zod";
import { CompleteOrder, RelatedOrderModel } from "./index";

export const ItemModel = z.object({
  id: z.number().int(),
  product: z.string(),
  price: z.number(),
  quantity: z.number().int(),
  orderId: z.string(),
});

export interface CompleteItem extends z.infer<typeof ItemModel> {
  order: CompleteOrder;
}

/**
 * RelatedItemModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedItemModel: z.ZodSchema<CompleteItem> = z.lazy(() =>
  ItemModel.extend({
    order: RelatedOrderModel,
  })
);
