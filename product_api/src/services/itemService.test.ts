import { randomUUID } from "crypto";
import { join } from "path";
import prisma from "../client";
import ItemService from "./itemService";
import OrderService from "./orderService";

const uuid1 = randomUUID();
const uuid2 = randomUUID();
const orderService = new OrderService();

describe("Test Item", () => {
  test("should be defined", () => {
    const instance = new ItemService();
    expect(instance).toBeDefined();
  });

  const prismaBinary = join(
    __dirname,
    "..",
    "..",
    "node_modules",
    ".bin",
    "prisma"
  );

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.product.deleteMany();
    await prisma.order.deleteMany();
    await prisma.item.deleteMany();

    await prisma.product.createMany({
      data: [
        {
          id: uuid1,
          name: "Apple",
          price: 8,
          description: "Apple",
          img: "https://back.femininbio.com/attachments/2020/11/20/square/w1000/11065-banane.jpg",
        },
        {
          id: uuid2,
          name: "Kiwi",
          price: 4,
          description: "Kiwi",
          img: "https://back.femininbio.com/attachments/2020/11/20/square/w1000/11065-banane.jpg",
        },
      ],
    });
  });

  test("generate item", async () => {
    const itemService = new ItemService();

    const res = await itemService.generate(uuid1, 3);

    expect(res.price).toEqual(8);
    expect(res.product).toEqual("Apple");
    expect(res.quantity).toEqual(3);
  });

  test("generate item invalid product", async () => {
    const itemService = new ItemService();

    const res = async () => await itemService.generate(randomUUID(), 3);

    expect(res).rejects.toThrowError();
  });

  test("getAll", async () => {
    const itemService = new ItemService();

    await prisma.item.create({
      data: { price: 2, product: "banana", quantity: 2 },
    });
    await prisma.item.create({
      data: { price: 2, product: "kiwi", quantity: 4 },
    });
    await prisma.item.create({
      data: { price: 2, product: "banana", quantity: 9 },
    });
    const res = await itemService.getAll();

    expect(res.length).toEqual(3);
  });

  test("getByOrderID", async () => {
    const userUUID = randomUUID();
    await prisma.user.create({
      data: {
        id: userUUID,
        username: "Rich",
        email: "hello@prisma.io",
        password: "hello",
      },
    });
    const itemService = new ItemService();
    await orderService.create({
      userID: userUUID,
      orderProduct: [{ productId: uuid1, quantity: 3 }],
    });
    await orderService.create({
      userID: userUUID,
      orderProduct: [{ productId: uuid2, quantity: 8 }],
    });
    const order = await orderService.create({
      userID: userUUID,
      orderProduct: [
        { productId: uuid1, quantity: 4 },
        { productId: uuid2, quantity: 7 },
      ],
    });

    const res = await itemService.getByOrderId(order?.id as string);

    expect(res.length).toEqual(2);
  });
});
