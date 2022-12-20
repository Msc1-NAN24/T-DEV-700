import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import prisma from "../client";
import { CustomError } from "../types/error";
import uuid from "uuid";

export async function getCurrentChequeUuid(userId: string) {
  try {
    const account = await prisma.account.findUnique({
      select: {
        cheque_uuid: true,
      },
      where: {
        user_id: userId,
      },
    });

    if (account) {
      return account.cheque_uuid;
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

export async function validateCheque(chequeUuid: string) {
  try {
    const account = await prisma.account.findUnique({
      select: {
        user_id: true,
        cheque_uuid: true,
      },
      where: {
        cheque_uuid: chequeUuid,
      },
    });

    if (account) {
      if (account.cheque_uuid === chequeUuid) {
        return account.user_id;
      } else {
        return false;
      }
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

export async function regenerateCheque(userId: string) {
  try {
    const account = await prisma.account.findUnique({
      select: {
        cheque_uuid: true,
      },
      where: {
        user_id: userId,
      },
    });

    if (account) {
      const chequeUuid = uuid.v4();
      await prisma.account.update({
        where: {
          user_id: userId,
        },
        data: {
          cheque_uuid: chequeUuid,
        },
      });
      return chequeUuid;
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
  getCurrentChequeUuid,
  validateCheque,
  regenerateCheque,
};
