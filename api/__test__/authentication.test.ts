import { faker } from "@faker-js/faker";
import {
  ILoginInput,
  IRegisterInput,
  login,
  register,
} from "../src/controllers/authentication";
import { prismaMock } from "../src/singleton";
import { CustomError } from "../src/types/error";
import bcrypt from "bcrypt";

import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

dotenvExpand.expand(dotenv.config());

describe("Authentication", () => {
  describe("register", () => {
    const password = faker.internet.password();
    const input: IRegisterInput = {
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password,
      confirm_password: password,
    };

    it("should create a user", async () => {
      prismaMock.user.create.mockResolvedValue({
        id: faker.datatype.uuid(),
        first_name: input.first_name,
        last_name: input.last_name,
        username: input.username,
        email: input.email,
        password: input.password,
        is_admin: false,
      });

      const { token } = await register(input);

      expect(token).toBeDefined();

      // check that the token is a JSON web token
      expect(token).toMatch(
        /^[A-Za-z0-9-_=]+.[A-Za-z0-9-_=]+.?[A-Za-z0-9-_.+/=]*$/
      );
    });

    it("should throw an error if passwords don't match", async () => {
      const input: IRegisterInput = {
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        confirm_password: faker.internet.password(),
      };

      await expect(register(input)).rejects.toThrow(CustomError);
    });

    it("should throw an error if the user already exists", async () => {
      prismaMock.user.create.mockRejectedValue({
        code: "P2002",
      });

      await expect(register(input)).rejects.toThrow(CustomError);
    });

    it("should return a JSON web token when the user is created successfully", async () => {
      // Mock the prisma.user.create method to return a user
      prismaMock.user.create.mockResolvedValue({
        id: faker.datatype.uuid(),
        first_name: input.first_name,
        last_name: input.last_name,
        username: input.username,
        email: input.email,
        password: input.password,
        is_admin: false,
      });

      const { token } = await register(input);

      expect(token).toBeDefined();

      // check that the token is a JSON web token
      expect(token).toMatch(
        /^[A-Za-z0-9-_=]+.[A-Za-z0-9-_=]+.?[A-Za-z0-9-_.+/=]*$/
      );
    });

    it("should throw an error if there is an internal server error", async () => {
      // Mock the prisma.user.create method to throw an error
      prismaMock.user.create.mockRejectedValue(
        new Error("Internal server error")
      );

      await expect(register(input)).rejects.toThrow(CustomError);
    });
  });

  dotenvExpand.expand(dotenv.config());

  describe("Authentication", () => {
    describe("login", () => {
      // Generate a random password and user input
      const password = faker.internet.password();
      const input: ILoginInput = {
        username: faker.internet.userName(),
        password,
      };

      it("should return a JSON web token when the user logs in successfully", async () => {
        // Mock the prisma.user.findUnique method to return a user
        prismaMock.user.findUnique.mockResolvedValue({
          id: faker.datatype.uuid(),
          first_name: faker.name.firstName(),
          username: input.username,
          last_name: faker.name.lastName(),
          email: faker.internet.email(),
          password: await bcrypt.hash(password, 10),
          is_admin: false,
        });

        const { token } = await login(input);

        expect(token).toBeDefined();

        // check that the token is a JSON web token
        expect(token).toMatch(
          /^[A-Za-z0-9-_=]+.[A-Za-z0-9-_=]+.?[A-Za-z0-9-_.+/=]*$/
        );
      });

      it("should throw an error if the user's credentials are invalid", async () => {
        // Mock the prisma.user.findUnique method to return undefined
        prismaMock.user.findUnique.mockResolvedValue(null);

        await expect(login(input)).rejects.toThrow(CustomError);
      });

      it("should throw an error if there is an internal server error", async () => {
        // Mock the prisma.user.findUnique method to throw an error
        prismaMock.user.findUnique.mockRejectedValue(
          new Error("Internal server error")
        );

        await expect(login(input)).rejects.toThrow(CustomError);
      });
    });
  });
});
