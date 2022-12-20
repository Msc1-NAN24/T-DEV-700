import ProductService from "./productService";

import { Prisma, Product } from "@prisma/client";
import { randomUUID } from "crypto";
import { execSync } from "child_process";
import { join } from "path";
import prisma from "../client";

describe("Test Pruduct", () => {
  test("should be defined", () => {
    const instance = new ProductService();
    expect(instance).toBeDefined();
  });
});

const uuid = randomUUID();
const product: Product = {
  id: uuid,
  name: "banane",
  price: 6,
  description: "Essaie",
  img: "https://back.femininbio.com/attachments/2020/11/20/square/w1000/11065-banane.jpg",
};

const prismaBinary = join(
  __dirname,
  "..",
  "..",
  "node_modules",
  ".bin",
  "prisma"
);

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
});

test("should create new product ", async () => {
  const productService = new ProductService();
  const res = await productService.create(product);

  expect(res.id).toEqual(product.id);
  expect(res.description).toEqual(product.description);
  expect(res.name).toEqual(product.name);
  expect(res.price).toEqual(product.price);
  expect(res.img).toEqual(product.img);
});

test("Should get by ID", async () => {
  const productService = new ProductService();

  await productService.create(product);
  const res = await productService.getById(product.id);
  expect(res).toBeDefined();

  expect(res?.id).toEqual(product.id);
  expect(res?.name).toEqual(product.name);
  expect(res?.price).toEqual(product.price);
});

test("Update", async () => {
  const productService = new ProductService();

  await productService.create(product);
  const res = await productService.update(product.id, { price: 10 });

  expect(res?.price).toEqual(10);
});

test("Should getAll", async () => {
  const productService = new ProductService();

  const user2: Prisma.ProductCreateInput = {
    name: "Kiwi",
    price: 6,
    description: "Essaie",
    img: "https://back.femininbio.com/attachments/2020/11/20/square/w1000/11065-banane.jpg",
  };

  await productService.create(product);
  await productService.create(user2);
  const res = await productService.getAll();
  expect(res).toBeDefined();

  expect(res.length).toEqual(2);
});

test("Delete", async () => {
  const productService = new ProductService();

  await productService.create(product);
  await productService.deleteProduct(product.id);
  const res = await productService.getAll();
  expect(res.length).toEqual(0);
});

// test("Test error email no unique ", async () => {
//   const user2: product = {
//     id: randomUUID(),
//     username: "Bob",
//     email: "hello@prisma.io",
//     password: "hello",
//   };
//   await create(product);

//   expect(create(user2)).rejects.toThrow();
// });

// test("Test error username no unique ", async () => {
//   const user2: product = {
//     id: randomUUID(),
//     username: "RIch",
//     email: "test@prisma.io",
//     password: "hello",
//   };
//   await create(product);

//   expect(create(user2)).rejects.toThrow();
// });

// test("sum", () => {
//   expect(2 + 3).toEqual(5);
// });
