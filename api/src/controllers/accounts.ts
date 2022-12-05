import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { CustomError } from "../types/error";

const prisma = new PrismaClient();

export async function getAccount(userId: string) {
  try {
    const account =
      (await prisma.account.findUnique({
        select: {
          balance: true,
          blocked: true,
          ceiling: true,
          created_at: true,
          max_overdraft: true,
          refusal_count: true,
        },
        where: {
          user_id: userId,
        },
      })) ??
      (await prisma.account.create({
        select: {
          balance: true,
          blocked: true,
          ceiling: true,
          created_at: true,
          max_overdraft: true,
          refusal_count: true,
        },
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
