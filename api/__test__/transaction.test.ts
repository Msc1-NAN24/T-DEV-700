import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import crypto from "crypto";
import {
  creditCardTransaction,
  getTransactions,
  pay,
  transaction,
} from "../src/controllers/transactions";
import { prismaMock } from "../src/singleton";
import { CustomError } from "../src/types/error";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import {
  Account,
  Prisma,
  PrismaClient,
  Transaction,
  TransactionStatus,
  User,
} from "@prisma/client";

dotenvExpand.expand(dotenv.config());

const mockPassword = faker.internet.password();

const mockUser1 = {
  id: faker.datatype.uuid(),
  email: faker.internet.email(),
  first_name: faker.name.firstName(),
  last_name: faker.name.lastName(),
  username: faker.internet.userName(),
  password: bcrypt.hashSync(mockPassword, 10),
  created_at: faker.date.past(),
  is_admin: faker.datatype.boolean(),
};

const mockAccount1 = {
  id: faker.datatype.uuid(),
  credit_card: faker.datatype.string(),
  cheque_uuid: faker.datatype.uuid(),
  user_id: mockUser1.id,
  balance: faker.datatype.number(),
  blocked: faker.datatype.boolean(),
  ceiling: faker.datatype.number(),
  created_at: faker.date.past(),
  max_overdraft: faker.datatype.number(),
  refusal_count: faker.datatype.number(),
};

const mockUser2 = {
  id: faker.datatype.uuid(),
  email: faker.internet.email(),
  first_name: faker.name.firstName(),
  last_name: faker.name.lastName(),
  username: faker.internet.userName(),
  password: bcrypt.hashSync(mockPassword, 10),
  created_at: faker.date.past(),
  is_admin: faker.datatype.boolean(),
};

const mockAccount2 = {
  id: faker.datatype.uuid(),
  credit_card: faker.datatype.string(),
  cheque_uuid: faker.datatype.uuid(),
  user_id: mockUser2.id,
  balance: faker.datatype.number(),
  blocked: faker.datatype.boolean(),
  ceiling: faker.datatype.number(),
  created_at: faker.date.past(),
  max_overdraft: faker.datatype.number(),
  refusal_count: faker.datatype.number(),
};

describe("transactions", () => {
  describe("transaction", () => {
    it("should return transaction", async () => {
      const mockTransaction: Transaction = {
        id: faker.datatype.uuid(),
        amount: faker.datatype.number(),
        created_at: faker.date.past(),
        sender_id: mockAccount1.id,
        receiver_id: mockAccount2.id,
        status: "PENDING",
      };

      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser1);
      prismaMock.account.findUnique.mockResolvedValueOnce(mockAccount1);
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser2);
      prismaMock.account.findUnique.mockResolvedValueOnce(mockAccount2);
      prismaMock.transaction.create.mockResolvedValueOnce(mockTransaction);
      prismaMock.transaction.update.mockResolvedValueOnce({
        ...mockTransaction,
        status: "ACCEPTED",
      });

      // Returns void because it's a transaction
      await expect(
        transaction({
          amount: faker.datatype.number(),
          recipientId: mockAccount2.id,
          senderId: mockAccount1.id,
        })
      ).resolves.toBeUndefined();
    });

    it("should throw error if sender is not found", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser1);
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      await expect(
        transaction({
          amount: faker.datatype.number(),
          recipientId: mockAccount2.id,
          senderId: mockAccount1.id,
        })
      ).rejects.toThrowError(CustomError.notFound("User not found"));
    });

    it("should throw error if recipient is not found", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser2);

      await expect(
        transaction({
          amount: faker.datatype.number(),
          recipientId: mockAccount2.id,
          senderId: mockAccount1.id,
        })
      ).rejects.toThrowError(CustomError.notFound("User not found"));
    });

    it("should throw if sender ceiling is exceeded", async () => {
      const mockUser1WithAccount = {
        ...mockUser1,
        account: {
          ...mockAccount1,
          ceiling: 0,
        },
      };

      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser1WithAccount);
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser2);

      prismaMock.transaction.create.mockResolvedValueOnce({
        id: faker.datatype.uuid(),
        amount: faker.datatype.number(),
        created_at: faker.date.past(),
        sender_id: mockAccount1.id,
        receiver_id: mockAccount2.id,
        status: "PENDING",
      });

      prismaMock.transaction.update.mockResolvedValueOnce({
        id: faker.datatype.uuid(),
        amount: faker.datatype.number(),
        created_at: faker.date.past(),
        sender_id: mockAccount1.id,
        receiver_id: mockAccount2.id,
        status: "REFUSED",
      });

      prismaMock.user.update.mockResolvedValueOnce(mockUser1);

      await expect(
        transaction({
          amount: 100,
          recipientId: mockAccount2.id,
          senderId: mockAccount1.id,
        })
      ).rejects.toThrowError(CustomError.forbidden("Amount exceeds ceiling"));
    });

    it("should throw if max overdraft is exceeded", async () => {
      const mockUser1WithAccount = {
        ...mockUser1,
        account: {
          ...mockAccount1,
          max_overdraft: 0,
          ceiling: 100,
          balance: 0,
        },
      };

      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser1WithAccount);
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser2);

      prismaMock.transaction.create.mockResolvedValueOnce({
        id: faker.datatype.uuid(),
        amount: faker.datatype.number(),
        created_at: faker.date.past(),
        sender_id: mockAccount1.id,
        receiver_id: mockAccount2.id,
        status: "PENDING",
      });

      prismaMock.transaction.update.mockResolvedValueOnce({
        id: faker.datatype.uuid(),
        amount: faker.datatype.number(),
        created_at: faker.date.past(),
        sender_id: mockAccount1.id,
        receiver_id: mockAccount2.id,
        status: "REFUSED",
      });

      prismaMock.user.update.mockResolvedValueOnce(mockUser1);

      await expect(
        transaction({
          amount: 100,
          recipientId: mockAccount2.id,
          senderId: mockAccount1.id,
        })
      ).rejects.toThrowError(
        CustomError.forbidden("Amount exceeds max overdraft")
      );
    });

    it("should resolve if overdraft is authorized", async () => {
      const mockUser1WithAccount = {
        ...mockUser1,
        account: {
          ...mockAccount1,
          max_overdraft: 100,
          ceiling: 100,
          balance: 0,
        },
      };

      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser1WithAccount);
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser2);

      prismaMock.transaction.create.mockResolvedValueOnce({
        id: faker.datatype.uuid(),
        amount: faker.datatype.number(),
        created_at: faker.date.past(),
        sender_id: mockAccount1.id,
        receiver_id: mockAccount2.id,
        status: "PENDING",
      });

      prismaMock.transaction.update.mockResolvedValueOnce({
        id: faker.datatype.uuid(),
        amount: faker.datatype.number(),
        created_at: faker.date.past(),
        sender_id: mockAccount1.id,
        receiver_id: mockAccount2.id,
        status: "REFUSED",
      });

      prismaMock.user.update.mockResolvedValueOnce(mockUser1);

      await expect(
        transaction({
          amount: 100,
          recipientId: mockAccount2.id,
          senderId: mockAccount1.id,
        })
      ).resolves.toBeUndefined();
    });

    it("should throw if there is a Prisma Error", async () => {
      prismaMock.account.update.mockRejectedValueOnce(
        new PrismaClientKnownRequestError("Internal server error", {
          code: "P2025",
          clientVersion: "4.6.1",
        })
      );

      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser1);
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser2);

      await expect(
        transaction({
          amount: faker.datatype.number(),
          recipientId: mockAccount2.id,
          senderId: mockAccount1.id,
        })
      ).rejects.toThrowError(CustomError.badRequest());
    });

    it("should throw if there is an unknown Error", async () => {
      prismaMock.account.update.mockRejectedValueOnce(
        new Error("Internal server error")
      );

      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser1);
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser2);

      await expect(
        transaction({
          amount: faker.datatype.number(),
          recipientId: mockAccount2.id,
          senderId: mockAccount1.id,
        })
      ).rejects.toThrowError(CustomError.internalServerError());
    });
  });

  describe("pay", () => {
    it("should return undefined for a valid transaction", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser1);
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser2);

      prismaMock.transaction.create.mockResolvedValueOnce({
        id: faker.datatype.uuid(),
        amount: faker.datatype.number(),
        created_at: faker.date.past(),
        sender_id: mockAccount1.id,
        receiver_id: mockAccount2.id,
        status: "PENDING",
      });

      await expect(
        pay({
          amount: faker.datatype.number(),
          recipientId: mockAccount2.id,
          senderId: mockAccount1.id,
        })
      ).resolves.toBeUndefined();
    });
  });

  describe("getTransactions", () => {
    it("should return an array of transactions", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser1);

      prismaMock.transaction.findMany.mockResolvedValueOnce([
        {
          id: faker.datatype.uuid(),
          amount: faker.datatype.number(),
          created_at: faker.date.past(),
          sender_id: mockAccount1.id,
          receiver_id: mockAccount2.id,
          status: "PENDING",
        },
        {
          id: faker.datatype.uuid(),
          amount: faker.datatype.number(),
          created_at: faker.date.past(),
          sender_id: mockAccount1.id,
          receiver_id: mockAccount2.id,
          status: "PENDING",
        },
      ]);

      await expect(
        getTransactions({
          userId: mockUser1.id,
        })
      ).resolves.toHaveLength(2);
    });

    it("should throw if the user can't be found", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      await expect(
        getTransactions({
          userId: mockUser1.id,
        })
      ).rejects.toThrowError(CustomError.notFound("User not found"));
    });

    it("should throw if there is a Prisma Error", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser1);

      prismaMock.transaction.findMany.mockRejectedValueOnce(
        new PrismaClientKnownRequestError("Internal server error", {
          code: "P2025",
          clientVersion: "4.6.1",
        })
      );

      await expect(
        getTransactions({
          userId: mockUser1.id,
        })
      ).rejects.toThrowError(CustomError.badRequest());
    });

    it("should throw if there is an unknown Error", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser1);

      prismaMock.transaction.findMany.mockRejectedValueOnce(
        new Error("Internal server error")
      );

      await expect(
        getTransactions({
          userId: mockUser1.id,
        })
      ).rejects.toThrowError(CustomError.internalServerError());
    });
  });

  describe("creditCardTransaction", () => {
    it("should return undefined for a valid transaction", async () => {
      const mockAccount1WithUserWithAccount = {
        ...mockAccount1,
        max_overdraft: 100,
        ceiling: 100,
        balance: 100,
        user: {
          ...mockUser1,
          account: {
            ...mockAccount1,
            max_overdraft: 100,
            ceiling: 100,
            balance: 100,
          },
        },
      };

      prismaMock.account.findUnique.mockResolvedValueOnce(
        mockAccount1WithUserWithAccount
      );
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser2);

      prismaMock.transaction.create.mockResolvedValueOnce({
        id: faker.datatype.uuid(),
        amount: faker.datatype.number(),
        created_at: faker.date.past(),
        sender_id: mockAccount1.id,
        receiver_id: mockAccount2.id,
        status: "PENDING",
      });

      await expect(
        creditCardTransaction({
          amount: 100,
          recipientId: mockAccount2.id,
          creditCardId: mockAccount1.credit_card,
        })
      ).resolves.toBeUndefined();
    });

    it("should throw if the credit card can't be found", async () => {
      prismaMock.account.findUnique.mockResolvedValueOnce(null);

      await expect(
        creditCardTransaction({
          amount: faker.datatype.number(),
          recipientId: mockAccount2.id,
          creditCardId: mockAccount1.credit_card,
        })
      ).rejects.toThrowError(CustomError.notFound("Credit card not found"));
    });

    it("should throw if the user can't be found", async () => {
      prismaMock.account.findUnique.mockResolvedValueOnce(mockAccount1);

      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      await expect(
        creditCardTransaction({
          amount: faker.datatype.number(),
          recipientId: mockAccount2.id,
          creditCardId: mockAccount1.credit_card,
        })
      ).rejects.toThrowError(CustomError.notFound("User not found"));
    });

    it("should throw if the amount exceeds max overdraft", async () => {
      const mockAccount1WithUserWithAccount = {
        ...mockAccount1,
        max_overdraft: 0,
        ceiling: 100,
        balance: 0,
        user: {
          ...mockUser1,
          account: {
            ...mockAccount1,
            max_overdraft: 0,
            ceiling: 100,
            balance: 0,
          },
        },
      };

      prismaMock.account.findUnique.mockResolvedValueOnce(
        mockAccount1WithUserWithAccount
      );
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser2);

      prismaMock.transaction.create.mockResolvedValueOnce({
        id: faker.datatype.uuid(),
        amount: faker.datatype.number(),
        created_at: faker.date.past(),
        sender_id: mockAccount1.id,
        receiver_id: mockAccount2.id,
        status: "PENDING",
      });

      await expect(
        creditCardTransaction({
          amount: 100,
          recipientId: mockAccount2.id,
          creditCardId: mockAccount1.credit_card,
        })
      ).rejects.toThrowError(
        CustomError.badRequest("Amount exceeds max overdraft")
      );
    });

    it("should throw if the amount exceeds ceiling", async () => {
      const mockAccount1WithUserWithAccount = {
        ...mockAccount1,
        max_overdraft: 100,
        ceiling: 0,
        balance: 100,
        user: {
          ...mockUser1,
          account: {
            ...mockAccount1,
            max_overdraft: 100,
            ceiling: 0,
            balance: 100,
          },
        },
      };

      prismaMock.account.findUnique.mockResolvedValueOnce(
        mockAccount1WithUserWithAccount
      );
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser2);

      prismaMock.transaction.create.mockResolvedValueOnce({
        id: faker.datatype.uuid(),
        amount: faker.datatype.number(),
        created_at: faker.date.past(),
        sender_id: mockAccount1.id,
        receiver_id: mockAccount2.id,
        status: "PENDING",
      });

      await expect(
        creditCardTransaction({
          amount: 100,
          recipientId: mockAccount2.id,
          creditCardId: mockAccount1.credit_card,
        })
      ).rejects.toThrowError(CustomError.badRequest("Amount exceeds ceiling"));
    });

    it("should resolve if the amount doesn't exceed max overdraft", async () => {
      const mockAccount1WithUserWithAccount = {
        ...mockAccount1,
        max_overdraft: 100,
        ceiling: 100,
        balance: 0,
        user: {
          ...mockUser1,
          account: {
            ...mockAccount1,
            max_overdraft: 100,
            ceiling: 100,
            balance: 0,
          },
        },
      };

      prismaMock.account.findUnique.mockResolvedValueOnce(
        mockAccount1WithUserWithAccount
      );
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser2);

      prismaMock.transaction.create.mockResolvedValueOnce({
        id: faker.datatype.uuid(),
        amount: faker.datatype.number(),
        created_at: faker.date.past(),
        sender_id: mockAccount1.id,
        receiver_id: mockAccount2.id,
        status: "PENDING",
      });

      await expect(
        creditCardTransaction({
          amount: 100,
          recipientId: mockAccount2.id,
          creditCardId: mockAccount1.credit_card,
        })
      ).resolves.toBeUndefined();
    });

    it("should throw if there is a Prisma error", async () => {
      prismaMock.account.findUnique.mockResolvedValueOnce(mockAccount1);
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser2);

      prismaMock.transaction.create.mockRejectedValueOnce(
        new PrismaClientKnownRequestError("Internal server error", {
          code: "P2025",
          clientVersion: "4.6.1",
        })
      );

      await expect(
        creditCardTransaction({
          amount: faker.datatype.number(),
          recipientId: mockAccount2.id,
          creditCardId: mockAccount1.credit_card,
        })
      ).rejects.toThrowError(CustomError.badRequest());
    });

    it("should throw if there is an unknown error", async () => {
      prismaMock.account.findUnique.mockResolvedValueOnce(mockAccount1);
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser2);

      prismaMock.transaction.create.mockRejectedValueOnce(
        new Error("Internal server error")
      );

      await expect(
        creditCardTransaction({
          amount: faker.datatype.number(),
          recipientId: mockAccount2.id,
          creditCardId: mockAccount1.credit_card,
        })
      ).rejects.toThrowError(CustomError.internalServerError());
    });
  });
});
