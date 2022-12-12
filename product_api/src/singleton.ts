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

beforeEach(() => {
  execSync(`${prismaBinary} migrate reset --force`);
  execSync(`${prismaBinary} migrate deploy`);
  mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
