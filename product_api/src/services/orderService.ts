import { Item } from "@prisma/client";
import { prisma } from "..";
import ItemService from "./itemService";
import UserService from "./userService";

export interface IOrderProduct {
  productId: string;
  quantity: number;
}

export default class OrderService {
  itemService = new ItemService();
  userService = new UserService();
  create = async (orderInfo: {
    userID: string;
    orderProduct: IOrderProduct[];
  }) => {
    try {
      const { userID, orderProduct } = orderInfo;
      const items = await this.itemService.generateMany(orderProduct);

      const totalPrice = items
        .map((item) => item!.price * item!.quantity)
        .reduce((acc, value) => acc + value);

      const user = await this.userService.getById(userID);

      await prisma.user.update({ where: { id: userID }, data: {} });

      const order = await prisma.order.create({
        select: {
          user: {
            select: { id: true, email: true, password: true, username: true },
          },
          product: { select: { product: true, price: true, quantity: true } },
          id: true,
          price: true,
        },
        data: {
          price: totalPrice,
          product: {
            createMany: {
              data: items,
            },
          },
          user: {
            connect: {
              id: userID,
            },
          },
        },
      });
      return order;
    } catch (error) {
      console.log(error);
    }
  };

  getAllOrder = async () => {
    return await prisma.order.findMany({
      select: {
        id: true,
        price: true,
        product: {
          select: { id: true, product: true, quantity: true, price: true },
        },
      },
    });
  };

  getOrderByUserID = async (userId: string) => {
    const order = await prisma.order.findMany({
      where: { userId },
      select: {
        id: true,
        price: true,
        product: {
          select: { id: true, product: true, quantity: true, price: true },
        },
      },
    });
    return order;
  };

  getOrderById = async (orderId: string) => {
    return await prisma.order.findFirst({
      where: { id: orderId },
      select: {
        id: true,
        price: true,
        product: {
          select: { id: true, product: true, quantity: true, price: true },
        },
      },
    });
  };
}
