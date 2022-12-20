import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import prisma from "../client";
import { CustomError } from "../types/error";

export interface IRegisterInput {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  confirm_password: string;
}

export async function register(input: IRegisterInput) {
  try {
    const {
      first_name,
      last_name,
      username,
      email,
      password,
      confirm_password,
    } = input;

    if (password !== confirm_password) {
      throw CustomError.badRequest("Passwords do not match");
    }

    const user = await prisma.user.create({
      data: {
        first_name,
        last_name,
        username,
        email,
        password: await bcrypt.hash(password, 10),
        account: {
          create: {},
        },
      },
    });

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        admin: user.is_admin,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      }
    );

    return { token };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2002":
          throw CustomError.conflict("Username or email already exists");
        default:
          throw CustomError.internalServerError();
      }
    } else if (error instanceof CustomError) {
      throw error;
    } else {
      throw CustomError.internalServerError();
    }
  }
}

export interface ILoginInput {
  username: string;
  password: string;
}

export async function login(input: ILoginInput) {
  try {
    const { username, password } = input;

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      throw CustomError.credentialsError();
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw CustomError.credentialsError();
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        admin: user.is_admin,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      }
    );

    return token;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2025":
          throw CustomError.badRequest("User not found");
        default:
          throw CustomError.internalServerError();
      }
    } else if (error instanceof CustomError) {
      throw error;
    } else {
      throw CustomError.internalServerError();
    }
  }
}

export default {
  register,
  login,
};
