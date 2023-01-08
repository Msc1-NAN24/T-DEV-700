import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import crypto from "crypto";
import {
  getCurrentChequeUuid,
  regenerateCheque,
  validateCheque,
} from "../src/controllers/cheque";
import { prismaMock } from "../src/singleton";
import { CustomError } from "../src/types/error";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

dotenvExpand.expand(dotenv.config());

const mockPassword = faker.internet.password();

const mockUser = {
  id: faker.datatype.uuid(),
  email: faker.internet.email(),
  first_name: faker.name.firstName(),
  last_name: faker.name.lastName(),
  username: faker.internet.userName(),
  password: bcrypt.hashSync(mockPassword, 10),
  created_at: faker.date.past(),
  is_admin: faker.datatype.boolean(),
};

const mockAccount = {
  id: faker.datatype.uuid(),
  credit_card: faker.datatype.string(),
  cheque_uuid: faker.datatype.uuid(),
  user_id: mockUser.id,
  balance: faker.datatype.number(),
  blocked: faker.datatype.boolean(),
  ceiling: faker.datatype.number(),
  created_at: faker.date.past(),
  max_overdraft: faker.datatype.number(),
  refusal_count: faker.datatype.number(),
};

describe("cheque", () => {
  describe("getCurrentChequeUuid", () => {
    it("should return cheque uuid", async () => {
      prismaMock.account.findUnique.mockResolvedValueOnce(mockAccount);

      const chequeUuid = await getCurrentChequeUuid(faker.datatype.uuid());

      expect(chequeUuid).toEqual(expect.any(String));
    });

    it("should throw account not found error", async () => {
      prismaMock.account.findUnique.mockResolvedValueOnce(null);

      await expect(getCurrentChequeUuid(faker.datatype.uuid())).rejects.toThrow(
        CustomError.notFound("Account not found")
      );
    });

    it("should throw user not found error", async () => {
      prismaMock.account.findUnique.mockRejectedValueOnce(
        new PrismaClientKnownRequestError("Internal server error", {
          code: "P2025",
          clientVersion: "4.6.1",
        })
      );

      await expect(getCurrentChequeUuid(faker.datatype.uuid())).rejects.toThrow(
        CustomError.badRequest("User not found")
      );
    });

    it("should throw internal server error", async () => {
      prismaMock.account.findUnique.mockRejectedValueOnce(
        new PrismaClientKnownRequestError("Internal server error", {
          code: "P2026",
          clientVersion: "4.6.1",
        })
      );

      await expect(getCurrentChequeUuid(faker.datatype.uuid())).rejects.toThrow(
        CustomError.internalServerError()
      );
    });

    it("should throw internal server error", async () => {
      prismaMock.account.findUnique.mockRejectedValueOnce(new Error());

      await expect(getCurrentChequeUuid(faker.datatype.uuid())).rejects.toThrow(
        CustomError.internalServerError()
      );
    });
  });

  describe("validateCheque", () => {
    it("should return the corresponding user id", async () => {
      prismaMock.account.findUnique.mockResolvedValueOnce(mockAccount);

      const result = await validateCheque(mockAccount.cheque_uuid);

      expect(result).toEqual(expect.any(String));
    });

    it("should throw account not found error", async () => {
      prismaMock.account.findUnique.mockResolvedValueOnce(null);

      await expect(validateCheque(faker.datatype.uuid())).rejects.toThrow(
        CustomError.notFound("Account not found")
      );
    });

    it("should return false if cheque is invalid", async () => {
      prismaMock.account.findUnique.mockResolvedValueOnce(mockAccount);

      const result = await validateCheque(faker.datatype.uuid());

      expect(result).toEqual(false);
    });

    it("should throw user not found error", async () => {
      prismaMock.account.findUnique.mockRejectedValueOnce(
        new PrismaClientKnownRequestError("Internal server error", {
          code: "P2025",
          clientVersion: "4.6.1",
        })
      );

      await expect(validateCheque(faker.datatype.uuid())).rejects.toThrow(
        CustomError.badRequest("User not found")
      );
    });

    it("should throw internal server error", async () => {
      prismaMock.account.findUnique.mockRejectedValueOnce(
        new PrismaClientKnownRequestError("Internal server error", {
          code: "P2026",
          clientVersion: "4.6.1",
        })
      );

      await expect(validateCheque(faker.datatype.uuid())).rejects.toThrow(
        CustomError.internalServerError()
      );
    });

    it("should throw internal server error", async () => {
      prismaMock.account.findUnique.mockRejectedValueOnce(new Error());

      await expect(validateCheque(faker.datatype.uuid())).rejects.toThrow(
        CustomError.internalServerError()
      );
    });
  });

  describe("regenerateCheque", () => {
    it("should return the new cheque uuid", async () => {
      prismaMock.account.findUnique.mockResolvedValueOnce(mockAccount);
      prismaMock.account.update.mockResolvedValueOnce({
        ...mockAccount,
        cheque_uuid: faker.datatype.uuid(),
      });

      const result = await regenerateCheque(faker.datatype.uuid());

      expect(result).toEqual(expect.any(String));
    });

    it("should throw account not found error", async () => {
      prismaMock.account.findUnique.mockResolvedValueOnce(null);

      await expect(regenerateCheque(faker.datatype.uuid())).rejects.toThrow(
        CustomError.notFound("Account not found")
      );
    });

    it("should throw user not found error", async () => {
      prismaMock.account.findUnique.mockRejectedValueOnce(
        new PrismaClientKnownRequestError("Internal server error", {
          code: "P2025",
          clientVersion: "4.6.1",
        })
      );

      await expect(regenerateCheque(faker.datatype.uuid())).rejects.toThrow(
        CustomError.badRequest("User not found")
      );
    });

    it("should throw internal server error", async () => {
      prismaMock.account.findUnique.mockRejectedValueOnce(
        new PrismaClientKnownRequestError("Internal server error", {
          code: "P2026",
          clientVersion: "4.6.1",
        })
      );

      await expect(regenerateCheque(faker.datatype.uuid())).rejects.toThrow(
        CustomError.internalServerError()
      );
    });

    it("should throw internal server error", async () => {
      prismaMock.account.findUnique.mockRejectedValueOnce(new Error());

      await expect(regenerateCheque(faker.datatype.uuid())).rejects.toThrow(
        CustomError.internalServerError()
      );
    });
  });
});
