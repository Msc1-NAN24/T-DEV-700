import { Item } from "@prisma/client";
import { prisma } from "..";
import ItemService from "./itemService";

export interface IOrderProduct {
  productId: string;
  quantity: number;
}

export default class OrderService {
  itemService = new ItemService();
  create = async (orderProduct: IOrderProduct[]) => {
    const items = await Promise.all(
      orderProduct.map(async (product) => {
        const item = await this.itemService.generate(
          product.productId,
          product.quantity
        );
        return item;
      })
    );
    const totalPrice = items
      .map((item) => item.price * item.quantity)
      .reduce((acc, value) => acc + value);

    const order = await prisma.order.create({
      data: {
        price: totalPrice,
      },
    });
  };
}
