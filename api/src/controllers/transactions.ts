import { PrismaClient, TransactionStatus } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { CustomError } from "../types/error";

const prisma = new PrismaClient();

export interface ITransactionInput {
  amount: number;
  senderId: string;
  recipientId: string;
}

export async function transaction(input: ITransactionInput) {
  try {
    const receiver = await prisma.user.findUnique({
      where: {
        id: input.recipientId,
      },
      include: {
        account: true,
      },
    });

    const sender = await prisma.user.findUnique({
      where: {
        id: input.senderId,
      },
      include: {
        account: true,
      },
    });

    if (!sender || !receiver) {
      throw CustomError.badRequest("User not found");
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: input.amount,
        receiver: {
          connectOrCreate: {
            where: {
              user_id: receiver.id,
            },
            create: {
              user: {
                connect: {
                  id: receiver.id,
                },
              },
            },
          },
        },
        sender: {
          connectOrCreate: {
            where: {
              user_id: sender.id,
            },
            create: {
              user: {
                connect: {
                  id: sender.id,
                },
              },
            },
          },
        },
      },
    });

    if (sender.account && sender.account.ceiling < input.amount) {
      await prisma.transaction.update({
        where: {
          id: transaction.id,
        },
        data: {
          status: "REFUSED",
        },
      });

      await prisma.user.update({
        where: {
          id: sender.id,
        },
        include: {
          account: true,
        },
        data: {
          account: {
            update: {
              refusal_count: {
                increment: 1,
              },
            },
          },
        },
      });

      throw CustomError.forbidden("Amount exceeds ceiling");
    }

    var isOverdraft = false;

    if (sender.account && sender.account.balance < input.amount) {
      if (
        sender.account.max_overdraft <
        input.amount - sender.account.balance
      ) {
        throw CustomError.forbidden("Amount exceeds max overdraft");
      }
      isOverdraft = true;
    }

    await prisma.account.update({
      where: {
        user_id: sender.id,
      },
      data: {
        balance: {
          decrement: input.amount,
        },
      },
    });

    await prisma.account.update({
      where: {
        user_id: receiver.id,
      },
      data: {
        balance: {
          increment: input.amount,
        },
      },
    });

    await prisma.transaction.update({
      where: {
        id: transaction.id,
      },
      data: {
        status: isOverdraft ? "OVERDRAFT" : "ACCEPTED",
      },
    });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      throw CustomError.badRequest(err.message);
    } else if (err instanceof CustomError) {
      throw err;
    } else {
      throw CustomError.internalServerError();
    }
  }
}

export async function pay(input: ITransactionInput) {
  return await transaction({
    amount: input.amount,
    senderId: input.senderId,
    recipientId: input.recipientId,
  });
}

export async function charge(input: ITransactionInput) {
  return await transaction({
    amount: input.amount,
    senderId: input.recipientId,
    recipientId: input.senderId,
  });
}

export interface IGetTransactionsInput {
  userId: string;
  limit?: number;
  offset?: number;
  status?: TransactionStatus;
}

export async function getTransactions(input: IGetTransactionsInput) {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          {
            sender: {
              user_id: input.userId,
            },
          },
          {
            receiver: {
              user_id: input.userId,
            },
          },
        ],
        status: input.status,
      },
      include: {
        sender: true,
        receiver: true,
      },
      take: input.limit,
      skip: input.offset,
    });

    return transactions;
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      throw CustomError.badRequest(err.message);
    } else if (err instanceof CustomError) {
      throw err;
    } else {
      throw CustomError.internalServerError();
    }
  }
}

export default {
  transaction,
  pay,
  charge,
  getTransactions,
};
