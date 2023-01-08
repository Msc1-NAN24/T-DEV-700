import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import bcrypt from "bcrypt";

import { CustomError } from "../types/error";

import prisma from "../client";

export async function get(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      select: {
        id: true,
        first_name: true,
        last_name: true,
        username: true,
        email: true,
        is_admin: true,
        account: {
          select: {
            id: true,
            balance: true,
            blocked: true,
            ceiling: true,
            max_overdraft: true,
            refusal_count: true,
          },
        },
      },
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw CustomError.notFound("User not found");
    }

    return user;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2025":
          throw CustomError.notFound("User not found");
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

export interface IUpdateUser {
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  is_admin?: boolean;
}

export async function update(userId: string, data: IUpdateUser) {
  try {
    const user = await prisma.user.update({
      data,
      where: {
        id: userId,
      },
    });

    return user;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2025":
          throw CustomError.notFound("User not found");
        case "P2002":
          throw CustomError.badRequest("Invalid user data");
        default:
          throw CustomError.internalServerError();
      }
    } else {
      throw CustomError.internalServerError();
    }
  }
}

export async function remove(userId: string) {
  try {
    const user = await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return user;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2025":
          throw CustomError.notFound("User not found");
        default:
          throw CustomError.internalServerError();
      }
    } else {
      throw CustomError.internalServerError();
    }
  }
}

export async function updatePassword(
  userId: string,
  oldPassword: string,
  newPassword: string
) {
  try {
    const user = await prisma.user.findUnique({
      select: {
        id: true,
        password: true,
      },
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw CustomError.notFound("User not found");
    }

    if (!(await bcrypt.compare(oldPassword, user.password))) {
      throw CustomError.badRequest("Invalid password");
    }

    const password = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      data: {
        password,
      },
      where: {
        id: userId,
      },
    });

    return {
      id: user.id,
    };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2025":
          throw CustomError.notFound("User not found");
        case "P2002":
          throw CustomError.badRequest("Invalid password data");
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
  get,
  update,
  remove,
  updatePassword,
};
