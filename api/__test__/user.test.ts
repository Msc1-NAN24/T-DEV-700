import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

import { CustomError } from "../src/types/error";
import * as user from "../src/controllers/user";
import { prismaMock } from "../src/singleton";

describe("UserController", () => {
  describe("get", () => {
    const userId = faker.datatype.uuid();

    it("should return a user if a valid user ID is provided", async () => {
      // Mock the `prisma.user.findUnique` method to return a user object
      const mockUser = {
        id: userId,
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        is_admin: false,
        account: {
          id: faker.datatype.uuid(),
          balance: faker.finance.amount(),
          blocked: false,
          ceiling: faker.finance.amount(),
          max_overdraft: faker.finance.amount(),
          refusal_count: faker.datatype.number(),
        },
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await user.get(userId);

      expect(result).toBeDefined();
      expect(result).toEqual(mockUser);
    });

    it("should throw a not found error if the user ID is not found", async () => {
      // Mock the `prisma.user.findUnique` method to return null
      prismaMock.user.findUnique.mockResolvedValue(null);

      try {
        await user.get(userId);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty("statusCode", 404);
        expect(error).toHaveProperty("message", "User not found");
      }
    });

    it("should throw an error if there is an unknown error", async () => {
      // Mock the `prisma.user.findUnique` method to throw an error
      prismaMock.user.findUnique.mockRejectedValue(new Error("Database error"));

      try {
        await user.get(userId);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty("statusCode", 500);
        expect(error).toHaveProperty("message", "Internal server error");
      }
    });
  });

  describe("update", () => {
    const userId = faker.datatype.uuid();

    it("should update the user if a valid user ID is provided", async () => {
      // Mock the `prisma.user.update` method to return the updated user object
      const mockUser = {
        id: userId,
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        is_admin: false,
      };

      prismaMock.user.update.mockResolvedValue(mockUser);

      const result = await user.update(userId, mockUser);

      expect(result).toBeDefined();
      expect(result).toEqual(mockUser);
    });

    it("should throw a not found error if the user is not found for the provided user ID", async () => {
      // Mock the `prisma.user.update` method to return null
      prismaMock.user.update.mockRejectedValue(
        new PrismaClientKnownRequestError("User not found", {
          code: "P2025",
          clientVersion: "4.6.1",
        })
      );

      try {
        await user.update(userId, {});
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty("statusCode", 404);
        expect(error).toHaveProperty("message", "User not found");
      }
    });

    it("should throw an error if the username or email is already in use", async () => {
      // Mock the `prisma.user.update` method to throw an error
      prismaMock.user.update.mockRejectedValue(
        new PrismaClientKnownRequestError("Username or email already in use", {
          code: "P2002",
          clientVersion: "4.6.1",
        })
      );

      try {
        await user.update(userId, {});
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty("statusCode", 409);
        expect(error).toHaveProperty(
          "message",
          "Username or email already in use"
        );
      }
    });

    it("should throw an error if there is an unknown error", async () => {
      // Mock the `prisma.user.update` method to throw an error
      prismaMock.user.update.mockRejectedValue(new Error("Database error"));

      try {
        await user.update(userId, {});
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty("statusCode", 500);
        expect(error).toHaveProperty("message", "Internal server error");
      }
    });
  });

  describe("remove", () => {
    const userId = faker.datatype.uuid();

    it("should delete the user if a valid user ID is provided", async () => {
      // Mock the `prisma.user.delete` method to return the deleted user object
      const mockUser = {
        id: userId,
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        is_admin: false,
      };

      prismaMock.user.delete.mockResolvedValue(mockUser);

      const result = await user.remove(userId);

      expect(result).toBeDefined();
      expect(result).toEqual(mockUser);
    });

    it("should throw a not found error if the user is not found for the provided user ID", async () => {
      // Mock the `prisma.user.delete` method to return null
      prismaMock.user.delete.mockRejectedValue(
        new PrismaClientKnownRequestError("User not found", {
          code: "P2025",
          clientVersion: "4.6.1",
        })
      );

      try {
        await user.remove(userId);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty("statusCode", 404);
        expect(error).toHaveProperty("message", "User not found");
      }
    });

    it("should throw an error if there is an unknown error", async () => {
      // Mock the `prisma.user.delete` method to throw an error
      prismaMock.user.delete.mockRejectedValue(new Error("Database error"));

      try {
        await user.remove(userId);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty("statusCode", 500);
        expect(error).toHaveProperty("message", "Internal server error");
      }
    });
  });

  describe("updatePassword", () => {
    const userId = faker.datatype.uuid();

    it("should update the user password if a valid user ID is provided", async () => {
      // Mock the `prisma.user.update` method to return the updated user object
      const mockUser = {
        id: userId,
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        is_admin: false,
      };

      prismaMock.user.update.mockResolvedValue(mockUser);

      const result = await user.updatePassword(
        userId,
        mockUser.password,
        faker.internet.password()
      );

      expect(result).toBeDefined();
      expect(result).toEqual(mockUser);
    });

    it("should throw a not found error if the user is not found for the provided user ID", async () => {
      // Mock the `prisma.user.update` method to return null
      prismaMock.user.update.mockRejectedValue(
        new PrismaClientKnownRequestError("User not found", {
          code: "P2025",
          clientVersion: "4.6.1",
        })
      );

      try {
        await user.updatePassword(
          userId,
          faker.internet.password(),
          faker.internet.password()
        );
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty("statusCode", 404);
        expect(error).toHaveProperty("message", "User not found");
      }
    });

    it("should throw an error if the current password is incorrect", async () => {
      // Mock the `prisma.user.update` method to throw an error
      prismaMock.user.update.mockRejectedValue(
        new PrismaClientKnownRequestError("Incorrect password", {
          code: "P2002",
          clientVersion: "4.6.1",
        })
      );

      try {
        await user.updatePassword(
          userId,
          faker.internet.password(),
          faker.internet.password()
        );
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty("statusCode", 401);
        expect(error).toHaveProperty("message", "Incorrect password");
      }
    });

    it("should throw an error if there is an unknown error", async () => {
      // Mock the `prisma.user.update` method to throw an error
      prismaMock.user.update.mockRejectedValue(new Error("Database error"));

      try {
        await user.updatePassword(
          userId,
          faker.internet.password(),
          faker.internet.password()
        );
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty("statusCode", 500);
        expect(error).toHaveProperty("message", "Internal server error");
      }
    });
  });
});
