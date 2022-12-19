import { TransactionStatus } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

import prisma from "../client";
import { CustomError } from "../types/error";

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
      throw CustomError.badRequest();
    } else if (err instanceof CustomError) {
      throw err;
    } else {
      throw CustomError.internalServerError();
    }
  }
}

export async function pay(input: ITransactionInput) {
  return await transaction(input);
}

export interface IGetTransactionsInput {
  userId: string;
  limit?: number;
  offset?: number;
  status?: TransactionStatus;
}

export async function getTransactions(input: IGetTransactionsInput) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: input.userId,
      },
    });

    if (!user) {
      throw CustomError.notFound("User not found");
    }

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
      throw CustomError.badRequest();
    } else if (err instanceof CustomError) {
      throw err;
    } else {
      throw CustomError.internalServerError();
    }
  }
}

export async function creditCardTransaction(
  input: ICreditCardTransactionInput
) {
  try {
    const creditCard = await prisma.account.findUnique({
      where: {
        credit_card: input.creditCardId,
      },
      include: {
        user: true,
      },
    });

    if (!creditCard) {
      throw CustomError.notFound("Credit card not found");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: input.recipientId,
      },
      include: {
        account: true,
      },
    });

    if (!user) {
      throw CustomError.notFound("User not found");
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: input.amount,
        receiver: {
          connectOrCreate: {
            where: {
              user_id: user.id,
            },
            create: {
              user: {
                connect: {
                  id: user.id,
                },
              },
            },
          },
        },
        sender: {
          connectOrCreate: {
            where: {
              user_id: creditCard.user_id,
            },
            create: {
              user: {
                connect: {
                  id: creditCard.user_id,
                },
              },
            },
          },
        },
      },
    });

    var isOverdraft = false;

    if (user.account && user.account.balance < input.amount) {
      if (user.account.max_overdraft < input.amount - user.account.balance) {
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
            id: user.id,
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

        throw CustomError.forbidden("Amount exceeds max overdraft");
      }
      isOverdraft = true;
    }

    await prisma.account.update({
      where: {
        user_id: creditCard.user_id,
      },
      data: {
        balance: {
          decrement: input.amount,
        },
      },
    });

    await prisma.account.update({
      where: {
        user_id: user.id,
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

    return transaction;
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      throw CustomError.badRequest();
    } else if (err instanceof CustomError) {
      throw err;
    } else {
      throw CustomError.internalServerError();
    }
  }
}

export interface ICreditCardTransactionInput {
  amount: number;
  creditCardId: string;
  recipientId: string;
}

export default {
  transaction,
  pay,
  getTransactions,
  creditCardTransaction,
};
