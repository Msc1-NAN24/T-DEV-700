import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { CustomError } from "../types/error";

const prisma = new PrismaClient();

export async function getAccount(userId: string) {
  try {
    const account =
      (await prisma.account.findUnique({
        where: {
          user_id: userId,
        },
      })) ??
      (await prisma.account.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
        },
      }));

    if (account) {
      return account;
    } else {
      throw CustomError.notFound("Account not found");
    }
  } catch (error) {
    console.log(error);
    if (error instanceof CustomError) {
      throw error;
    } else if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2025":
          throw CustomError.badRequest("User not found");
        default:
          throw CustomError.internalServerError();
      }
    } else {
      throw CustomError.internalServerError();
    }
  }
}

export default {
  getAccount,
};
