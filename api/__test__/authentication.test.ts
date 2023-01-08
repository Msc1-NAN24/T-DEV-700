import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { login, register } from "../src/controllers/authentication";
import { prismaMock } from "../src/singleton";
import { CustomError } from "../src/types/error";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

dotenvExpand.expand(dotenv.config());

const mockPassword = faker.internet.password();

const mockUser = {
  id: faker.datatype.uuid(),
  first_name: faker.name.firstName(),
  last_name: faker.name.lastName(),
  username: faker.internet.userName(),
  email: faker.internet.email(),
  password: bcrypt.hashSync(mockPassword, 10),
  is_admin: false,
  created_at: faker.date.past(),
};

describe("Authentication", () => {
  describe("register", () => {
    it("should return token", async () => {
      prismaMock.user.create.mockResolvedValueOnce(mockUser);

      const password = faker.internet.password();

      const token = await register({
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password,
        confirm_password: password,
      });

      expect(token).toBeDefined();

      expect(token).toMatch(
        /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/
      );
    });

    it("should throw bad request error", async () => {
      await expect(
        register({
          first_name: faker.name.firstName(),
          last_name: faker.name.lastName(),
          username: faker.internet.userName(),
          email: faker.internet.email(),
          password: faker.internet.password(),
          confirm_password: faker.internet.password(),
        })
      ).rejects.toThrow(CustomError.badRequest("Passwords do not match"));
    });

    it("should throw conflict error", async () => {
      prismaMock.user.create.mockRejectedValueOnce(
        new PrismaClientKnownRequestError("", {
          code: "P2002",
          clientVersion: "4.6.1",
        })
      );

      await expect(
        register({
          first_name: faker.name.firstName(),
          last_name: faker.name.lastName(),
          username: faker.internet.userName(),
          email: faker.internet.email(),
          password: mockPassword,
          confirm_password: mockPassword,
        })
      ).rejects.toThrow(
        CustomError.conflict("Username or email already exists")
      );
    });

    it("should throw internal server error", async () => {
      prismaMock.user.create.mockRejectedValueOnce(
        new PrismaClientKnownRequestError("", {
          code: "0",
          clientVersion: "4.6.1",
        })
      );

      await expect(
        register({
          first_name: faker.name.firstName(),
          last_name: faker.name.lastName(),
          username: faker.internet.userName(),
          email: faker.internet.email(),
          password: mockPassword,
          confirm_password: mockPassword,
        })
      ).rejects.toThrow(CustomError.internalServerError());
    });

    it("should throw internal server error", async () => {
      prismaMock.user.create.mockRejectedValueOnce(new Error());

      await expect(
        register({
          first_name: faker.name.firstName(),
          last_name: faker.name.lastName(),
          username: faker.internet.userName(),
          email: faker.internet.email(),
          password: mockPassword,
          confirm_password: mockPassword,
        })
      ).rejects.toThrow(CustomError.internalServerError());
    });
  });

  describe("login", () => {
    it("should return token", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser);

      const token = await login({
        username: mockUser.username,
        password: mockPassword,
      });

      expect(token).toBeDefined();

      expect(token).toMatch(
        /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/
      );
    });

    it("should throw a credentials error", () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser);

      expect(
        login({
          username: mockUser.username,
          password: faker.internet.password(),
        })
      ).rejects.toThrow(CustomError.credentialsError());
    });

    it("should throw bad request error", async () => {
      await expect(
        login({
          username: faker.internet.userName(),
          password: faker.internet.password(),
        })
      ).rejects.toThrow(CustomError.credentialsError());
    });

    it("should throw user not found error", async () => {
      prismaMock.user.findUnique.mockRejectedValueOnce(
        new PrismaClientKnownRequestError("", {
          code: "P2025",
          clientVersion: "4.6.1",
        })
      );

      await expect(
        login({
          username: faker.internet.userName(),
          password: faker.internet.password(),
        })
      ).rejects.toThrow(CustomError.notFound("User not found"));
    });

    it("should throw internal server error", async () => {
      prismaMock.user.findUnique.mockRejectedValueOnce(
        new PrismaClientKnownRequestError("", {
          code: "0",
          clientVersion: "4.6.1",
        })
      );

      await expect(
        login({
          username: faker.internet.userName(),
          password: faker.internet.password(),
        })
      ).rejects.toThrow(CustomError.internalServerError());
    });

    it("should throw internal server error", async () => {
      prismaMock.user.findUnique.mockRejectedValueOnce(new Error());

      await expect(
        login({
          username: faker.internet.userName(),
          password: faker.internet.password(),
        })
      ).rejects.toThrow(CustomError.internalServerError());
    });
  });
});
