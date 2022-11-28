import * as z from "zod";
import {
  CompleteItem,
  RelatedItemModel,
  CompleteUser,
  RelatedUserModel,
} from "./index";

export const OrderModel = z.object({
  id: z.string(),
  price: z.number(),
  userId: z.string(),
});

export interface CompleteOrder extends z.infer<typeof OrderModel> {
  product: CompleteItem[];
  user: CompleteUser;
}

/**
 * RelatedOrderModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedOrderModel: z.ZodSchema<CompleteOrder> = z.lazy(() =>
  OrderModel.extend({
    product: RelatedItemModel.array(),
    user: RelatedUserModel,
  })
);
