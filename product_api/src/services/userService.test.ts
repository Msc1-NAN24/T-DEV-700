import { User } from "@prisma/client";
import { randomUUID } from "crypto";
import UserService from "./userService";
import { join } from "path";
import prisma from "../client";

const userService = new UserService();

const uuid = randomUUID();
const user: User = {
  id: uuid,
  username: "Rich",
  email: "hello@prisma.io",
  password: "hello",
};

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
});

afterEach(async () => {
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();
  await prisma.order.deleteMany();
  await prisma.item.deleteMany();
});

test("should create new user ", async () => {
  const res = await userService.create({
    username: "Rich",
    email: "hello@prisma.io",
    password: "hello",
  });

  expect(res.username).toEqual(user.username);
  expect(res.email).toEqual(user.email);
  expect(res.password).not.toEqual("hello");
});

test("Should get by ID", async () => {
  await prisma.user.create({
    data: {
      id: uuid,
      username: "Rich",
      email: "hello@prisma.io",
      password: "hello",
    },
  });
  const res = await userService.getById(user.id);

  expect(res?.id).toEqual(user.id);
  expect(res?.username).toEqual(user.username);
  expect(res?.email).toEqual(user.email);
});

test("Update", async () => {
  await userService.create(user);
  const res = await userService.update(user.id, { username: "Billy" });

  expect(res?.username).toEqual("Billy");
});

test("Should getAll", async () => {
  const user2: User = {
    id: randomUUID(),
    username: "Bob",
    email: "bob@prisma.io",
    password: "hello",
  };

  await prisma.user.create({ data: user });
  await prisma.user.create({ data: user2 });
  const res = await userService.getAll();
  expect(res).toBeDefined();

  expect(res.length).toEqual(2);
});

test("Delete", async () => {
  await userService.create(user);

  await userService.deleteUser(user.id);
  const res = await userService.getAll();
  expect(res.length).toEqual(0);
});

test("Test error email no unique ", async () => {
  const user2: User = {
    id: randomUUID(),
    username: "Bob",
    email: "hello@prisma.io",
    password: "hello",
  };
  await userService.create(user);

  expect(userService.create(user2)).rejects.toThrow();
});

test("Test error username no unique ", async () => {
  const user2: User = {
    id: randomUUID(),
    username: "Rich",
    email: "test@prisma.io",
    password: "hello",
  };
  await userService.create(user);

  expect(userService.create(user2)).rejects.toThrow();
});
