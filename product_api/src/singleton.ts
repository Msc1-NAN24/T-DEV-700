import { Prisma, PrismaClient } from "@prisma/client";
import { exec, execSync } from "child_process";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";
import { join } from "path";

import prisma from "./client";

jest.mock("./client", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

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

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
