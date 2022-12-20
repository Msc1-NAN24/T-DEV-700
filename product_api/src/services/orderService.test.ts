import { Product, User } from "@prisma/client";
import { join } from "path";
import { create } from "./userService";
import OrderService from "./orderService";
import prisma from "../client";
import { randomUUID } from "crypto";

test("should be defined", () => {
  const instance = new OrderService();
  expect(instance).toBeDefined();
});
// const uuid = randomUUID();

const prismaBinary = join(
  __dirname,
  "..",
  "..",
  "node_modules",
  ".bin",
  "prisma"
);

type Data = { user: User; products: Product[] };
const uuid1 = randomUUID();
const uuid2 = randomUUID();

afterEach(async () => {
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();
  await prisma.order.deleteMany();
  await prisma.item.deleteMany();
});

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

test("createOrder", async () => {
  const user = await create({
    username: "Rich",
    email: "hello@prisma.io",
    password: "hello",
  });

  const products = await prisma.product.findMany();
  const data: Data = { user, products };

  const orderService = new OrderService();
  const order = await orderService.create({
    userID: data.user.id,
    orderProduct: [
      { productId: uuid1, quantity: 3 },
      { productId: uuid2, quantity: 6 },
    ],
  });

  expect(order?.user.email).toEqual(user.email);
  expect(order?.price).toEqual(48);
});

test("createOrder invalid product", async () => {
  const user = await create({
    username: "Rich",
    email: "hello@prisma.io",
    password: "hello",
  });

  const products = await prisma.product.findMany();
  const data: Data = { user, products };

  const orderService = new OrderService();
  const order = async () =>
    await orderService.create({
      userID: randomUUID(),
      orderProduct: [
        { productId: randomUUID(), quantity: 3 },
        { productId: uuid2, quantity: 6 },
      ],
    });

  expect(order).rejects.toThrowError();
});

test("getAllOrder", async () => {
  const user = await create({
    username: "Rich",
    email: "hello@prisma.io",
    password: "hello",
  });

  const products = await prisma.product.findMany();
  const data: Data = { user, products };

  const orderService = new OrderService();
  await orderService.create({
    userID: data.user.id,
    orderProduct: [
      { productId: data.products[0].id, quantity: 3 },
      { productId: data.products[1].id, quantity: 6 },
    ],
  });

  await orderService.create({
    userID: data.user.id,
    orderProduct: [{ productId: data.products[0].id, quantity: 3 }],
  });

  const orders = await orderService.getAllOrder();

  expect(orders.length).toEqual(2);
});

test("getOrderById", async () => {
  const user = await create({
    username: "Rich",
    email: "hello@prisma.io",
    password: "hello",
  });

  const products = await prisma.product.findMany();
  const data: Data = { user, products };

  const orderService = new OrderService();
  const order = await orderService.create({
    userID: data.user.id,
    orderProduct: [
      { productId: data.products[0].id, quantity: 3 },
      { productId: data.products[1].id, quantity: 6 },
    ],
  });

  const getOrder = await orderService.getOrderById(order?.id as string);

  expect(getOrder?.id).toEqual(order?.id);
});

test("getOrderByUserID", async () => {
  const user = await create({
    username: "Rich",
    email: "hello@prisma.io",
    password: "hello",
  });

  const products = await prisma.product.findMany();
  const data: Data = { user, products };

  const orderService = new OrderService();
  await orderService.create({
    userID: data.user.id,
    orderProduct: [
      { productId: data.products[0].id, quantity: 3 },
      { productId: data.products[1].id, quantity: 6 },
    ],
  });

  await orderService.create({
    userID: data.user.id,
    orderProduct: [{ productId: data.products[0].id, quantity: 3 }],
  });

  const res = await orderService.getOrderByUserID(user.id);

  expect(res.length).toEqual(2);
});
