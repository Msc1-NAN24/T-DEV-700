import { Item, Order } from "@prisma/client";
import prisma from "../client";
import { IOrderProduct } from "./orderService";

export default class ItemService {
  generate = async (productId: string, quantity: number) => {
    const product = await prisma.product.findFirst({
      where: { id: productId },
    });

    if (!product) throw new Error("Invalide product");
    const item = {
      quantity,
      price: product.price,
      product: product.name,
    };

    return item;
  };

  generateMany = async (orderProductList: IOrderProduct[]) => {
    const items = Promise.all(
      orderProductList.map(async ({ productId, quantity }) => {
        const product = await prisma.product.findFirst({
          where: { id: productId },
        });
        if (!product) throw new Error("Invalide product");
        return {
          quantity,
          price: product.price,
          product: product.name,
        };
      })
    );
    return items;
  };

  getAll = async () => {
    return await prisma.item.findMany();
  };

  getByOrderId = async (orderId: string) => {
    const itemOrder = prisma.item.findMany({ where: { orderId } });
  };

  setOrder = async (order: Order, item: Item) => {
    return await prisma.item.update({
      where: { id: item.id },
      data: {
        orderId: order.id,
      },
    });
  };
}
