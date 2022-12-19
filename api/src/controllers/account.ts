import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

import prisma from "../client";
import { CustomError } from "../types/error";

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

export interface IAccountInput {
  ceiling?: number;
  max_overdraft?: number;
}

export async function updateAccount(userId: string, input: IAccountInput) {
  try {
    const account = await prisma.account.update({
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
      data: {
        ceiling: input.ceiling,
        max_overdraft: input.max_overdraft,
      },
    });

    if (account) {
      return account;
    } else {
      throw CustomError.notFound("Account not found");
    }
  } catch (error) {
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

export async function addCreditCard(userId: string, cardId: string) {
  try {
    const account = await prisma.account.update({
      select: {
        balance: true,
        blocked: true,
        ceiling: true,
        credit_card: true,
        refusal_count: true,
        max_overdraft: true,
      },
      data: {
        credit_card: cardId,
      },
      where: {
        user_id: userId,
      },
    });

    if (account) {
      return account;
    } else {
      throw CustomError.notFound("Account not found");
    }
  } catch (error) {
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
  updateAccount,
  addCreditCard,
};
