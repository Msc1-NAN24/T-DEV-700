import { faker } from "@faker-js/faker";
import {
  getAccount,
  IAccountInput,
  updateAccount,
} from "../src/controllers/account";
import { prismaMock } from "../src/singleton";
import { CustomError } from "../src/types/error";
import bcrypt from "bcrypt";

import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

dotenvExpand.expand(dotenv.config());

const mockUser = {
  id: faker.datatype.uuid(),
  email: faker.internet.email(),
  password: bcrypt.hashSync(faker.internet.password(), 10),
  created_at: faker.date.past(),
};

const mockAccount = {
  id: faker.datatype.uuid(),
  credit_card: faker.datatype.number(),
  cheque_uuid: faker.datatype.uuid(),
  user_id: mockUser.id,
  balance: faker.datatype.number(),
  blocked: faker.datatype.boolean(),
  ceiling: faker.datatype.number(),
  created_at: faker.date.past(),
  max_overdraft: faker.datatype.number(),
  refusal_count: faker.datatype.number(),
};

describe("Account controller", () => {
  describe("getAccount", () => {
    it("should return account", async () => {
      prismaMock.account.findUnique.mockResolvedValueOnce(mockAccount);

      const account = await getAccount(mockUser.id);

      expect(account).toEqual(mockAccount);
    });

    it("should throw not found error", async () => {
      prismaMock.account.findUnique.mockResolvedValueOnce(null);

      await expect(getAccount(mockUser.id)).rejects.toThrow(CustomError);
      await expect(getAccount(mockUser.id)).rejects.toThrow(
        CustomError.notFound("Account not found")
      );
    });

    it("should throw internal server error", async () => {
      prismaMock.account.findUnique.mockRejectedValueOnce(new Error());

      await expect(getAccount(mockUser.id)).rejects.toThrow(CustomError);
      await expect(getAccount(mockUser.id)).rejects.toThrow(
        CustomError.internalServerError()
      );
    });
  });

  describe("updateAccount", () => {
    it("should update account", async () => {
      prismaMock.account.update.mockResolvedValueOnce(mockAccount);

      const input: IAccountInput = {
        balance: faker.datatype.number(),
        blocked: faker.datatype.boolean(),
        ceiling: faker.datatype.number(),
        max_overdraft: faker.datatype.number(),
        refusalCount: faker.datatype.number(),
      };

      const account = await updateAccount(mockUser.id, input);

      expect(account).toEqual(mockAccount);
    });

    it("should throw not found error", async () => {
      prismaMock.account.update.mockRejectedValueOnce(
        new PrismaClientKnownRequestError("User not found", {
          code: "P2025",
          clientVersion: "4.6.1",
        })
      );

      const input: IAccountInput = {
        balance: faker.datatype.number(),
        blocked: faker.datatype.boolean(),
        ceiling: faker.datatype.number(),
        max_overdraft: faker.datatype.number(),
        refusalCount: faker.datatype.number(),
      };

      await expect(updateAccount(mockUser.id, input)).rejects.toThrow(
        CustomError
      );
      await expect(updateAccount(mockUser.id, input)).rejects.toThrow(
        CustomError.notFound("Account not found")
      );
    });

    it("should throw internal server error", async () => {
      prismaMock.account.update.mockRejectedValueOnce(new Error());

      const input: IAccountInput = {
        balance: faker.datatype.number(),
        blocked: faker.datatype.boolean(),
        ceiling: faker.datatype.number(),
        max_overdraft: faker.datatype.number(),
        refusalCount: faker.datatype.number(),
      };

      await expect(updateAccount(mockUser.id, input)).rejects.toThrow(
        CustomError
      );
      await expect(updateAccount(mockUser.id, input)).rejects.toThrow(
        CustomError.internalServerError()
      );
    });
  });
});
