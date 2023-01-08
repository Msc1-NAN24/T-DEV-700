import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { get, remove, update, updatePassword } from "../src/controllers/user";
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

describe("User controller", () => {
  describe("get", () => {
    it("should return user", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser);
      prismaMock.account.findUnique.mockResolvedValueOnce(mockAccount);

      const user = await get(mockUser.id);

      expect(user).toEqual(mockUser);
    });

    it("should throw not found error", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      await expect(get(mockUser.id)).rejects.toThrow(
        CustomError.notFound("User not found")
      );
    });

    it("should throw user not found error", async () => {
      prismaMock.user.findUnique.mockRejectedValueOnce(
        new PrismaClientKnownRequestError("Internal server error", {
          code: "P2025",
          clientVersion: "4.6.1",
        })
      );

      await expect(get(mockUser.id)).rejects.toThrow(
        CustomError.notFound("User not found")
      );
    });

    it("should throw internal server error", async () => {
      prismaMock.user.findUnique.mockRejectedValueOnce(
        new PrismaClientKnownRequestError("Internal server error", {
          code: "0",
          clientVersion: "4.6.1",
        })
      );

      await expect(get(mockUser.id)).rejects.toThrow(
        CustomError.internalServerError()
      );
    });

    it("should throw internal server error", async () => {
      prismaMock.user.findUnique.mockRejectedValueOnce(new Error());

      await expect(get(mockUser.id)).rejects.toThrow(
        CustomError.internalServerError()
      );
    });
  });

  describe("update", () => {
    it("should return user", async () => {
      prismaMock.user.update.mockResolvedValueOnce(mockUser);

      const user = await update(mockUser.id, {
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        username: faker.internet.userName(),
        email: faker.internet.email(),
        is_admin: faker.datatype.boolean(),
      });

      expect(user).toEqual(mockUser);
    });

    it("should throw not found error", async () => {
      prismaMock.user.update.mockRejectedValueOnce(
        new PrismaClientKnownRequestError("Internal server error", {
          code: "P2025",
          clientVersion: "4.6.1",
        })
      );

      await expect(
        update(mockUser.id, {
          first_name: faker.name.firstName(),
          last_name: faker.name.lastName(),
          username: faker.internet.userName(),
          email: faker.internet.email(),
          is_admin: faker.datatype.boolean(),
        })
      ).rejects.toThrow(CustomError.notFound("User not found"));
    });

    it("should throw a bad request error", async () => {
      prismaMock.user.update.mockRejectedValueOnce(
        new PrismaClientKnownRequestError("Internal server error", {
          code: "P2002",
          clientVersion: "4.6.1",
        })
      );

      await expect(
        update(mockUser.id, {
          first_name: faker.name.firstName(),
          last_name: faker.name.lastName(),
          username: faker.internet.userName(),
          email: faker.internet.email(),
          is_admin: faker.datatype.boolean(),
        })
      ).rejects.toThrow(CustomError.badRequest("Invalid user data"));
    });

    it("should throw internal server error", async () => {
      prismaMock.user.update.mockRejectedValueOnce(
        new PrismaClientKnownRequestError("Internal server error", {
          code: "0",
          clientVersion: "4.6.1",
        })
      );

      await expect(
        update(mockUser.id, {
          first_name: faker.name.firstName(),
          last_name: faker.name.lastName(),
          username: faker.internet.userName(),
          email: faker.internet.email(),
          is_admin: faker.datatype.boolean(),
        })
      ).rejects.toThrow(CustomError.internalServerError());
    });

    it("should throw internal server error", async () => {
      prismaMock.user.update.mockRejectedValueOnce(new Error());

      await expect(
        update(mockUser.id, {
          first_name: faker.name.firstName(),
          last_name: faker.name.lastName(),
          username: faker.internet.userName(),
          email: faker.internet.email(),
          is_admin: faker.datatype.boolean(),
        })
      ).rejects.toThrow(CustomError.internalServerError());
    });
  });

  describe("remove", () => {
    it("should return user", async () => {
      prismaMock.user.delete.mockResolvedValueOnce(mockUser);

      const user = await remove(mockUser.id);

      expect(user).toEqual(mockUser);
    });

    it("should throw not found error", async () => {
      prismaMock.user.delete.mockRejectedValueOnce(
        new PrismaClientKnownRequestError("Internal server error", {
          code: "P2025",
          clientVersion: "4.6.1",
        })
      );

      await expect(remove(mockUser.id)).rejects.toThrow(
        CustomError.notFound("User not found")
      );
    });

    it("should throw internal server error", async () => {
      prismaMock.user.delete.mockRejectedValueOnce(
        new PrismaClientKnownRequestError("Internal server error", {
          code: "0",
          clientVersion: "4.6.1",
        })
      );

      await expect(remove(mockUser.id)).rejects.toThrow(
        CustomError.internalServerError()
      );
    });

    it("should throw internal server error", async () => {
      prismaMock.user.delete.mockRejectedValueOnce(new Error());

      await expect(remove(mockUser.id)).rejects.toThrow(
        CustomError.internalServerError()
      );
    });
  });

  describe("updatePassword", () => {
    it("should return user", async () => {
      const newPassword = faker.internet.password();

      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser);
      prismaMock.user.update.mockResolvedValueOnce({
        ...mockUser,
        password: bcrypt.hashSync(newPassword, 10),
      });

      const user = await updatePassword(mockUser.id, mockPassword, newPassword);

      expect(user).toEqual({
        id: mockUser.id,
      });
    });

    it("should throw a user not found error", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      await expect(
        updatePassword(mockUser.id, mockPassword, faker.internet.password())
      ).rejects.toThrow(CustomError.notFound("User not found"));
    });

    it("should throw a bad request error", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser);

      await expect(
        updatePassword(mockUser.id, faker.internet.password(), "")
      ).rejects.toThrow(CustomError.badRequest("Invalid password"));
    });

    it("should throw a not found error", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser);
      prismaMock.user.update.mockRejectedValueOnce(
        new PrismaClientKnownRequestError("Internal server error", {
          code: "P2025",
          clientVersion: "4.6.1",
        })
      );

      await expect(
        updatePassword(mockUser.id, mockPassword, faker.internet.password())
      ).rejects.toThrow(CustomError.notFound("User not found"));
    });

    it("should throw a bad request error", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser);
      prismaMock.user.update.mockRejectedValueOnce(
        new PrismaClientKnownRequestError("Internal server error", {
          code: "P2002",
          clientVersion: "4.6.1",
        })
      );

      await expect(
        updatePassword(mockUser.id, mockPassword, faker.internet.password())
      ).rejects.toThrow(CustomError.badRequest("Invalid password data"));
    });

    it("should throw internal server error", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser);
      prismaMock.user.update.mockRejectedValueOnce(
        new PrismaClientKnownRequestError("Internal server error", {
          code: "0",
          clientVersion: "4.6.1",
        })
      );

      await expect(
        updatePassword(mockUser.id, mockPassword, faker.internet.password())
      ).rejects.toThrow(CustomError.internalServerError());
    });

    it("should throw internal server error", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser);
      prismaMock.user.update.mockRejectedValueOnce(new Error());

      await expect(
        updatePassword(mockUser.id, mockPassword, faker.internet.password())
      ).rejects.toThrow(CustomError.internalServerError());
    });
  });
});
