"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.creditCardTransaction =
  exports.getTransactions =
  exports.pay =
  exports.transaction =
    void 0;
const runtime_1 = require("@prisma/client/runtime");
const client_1 = __importDefault(require("../client"));
const error_1 = require("../types/error");
function transaction(input) {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      const receiver = yield client_1.default.user.findUnique({
        where: {
          id: input.recipientId,
        },
        include: {
          account: true,
        },
      });
      const sender = yield client_1.default.user.findUnique({
        where: {
          id: input.senderId,
        },
        include: {
          account: true,
        },
      });
      if (!sender || !receiver) {
        throw error_1.CustomError.badRequest("User not found");
      }
      const transaction = yield client_1.default.transaction.create({
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
        yield client_1.default.transaction.update({
          where: {
            id: transaction.id,
          },
          data: {
            status: "REFUSED",
          },
        });
        yield client_1.default.user.update({
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
        throw error_1.CustomError.forbidden("Amount exceeds ceiling");
      }
      var isOverdraft = false;
      if (sender.account && sender.account.balance < input.amount) {
        if (
          sender.account.max_overdraft <
          input.amount - sender.account.balance
        ) {
          yield client_1.default.transaction.update({
            where: {
              id: transaction.id,
            },
            data: {
              status: "REFUSED",
            },
          });
          yield client_1.default.user.update({
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
          throw error_1.CustomError.forbidden("Amount exceeds max overdraft");
        }
        isOverdraft = true;
      }
      yield client_1.default.account.update({
        where: {
          user_id: sender.id,
        },
        data: {
          balance: {
            decrement: input.amount,
          },
        },
      });
      yield client_1.default.account.update({
        where: {
          user_id: receiver.id,
        },
        data: {
          balance: {
            increment: input.amount,
          },
        },
      });
      yield client_1.default.transaction.update({
        where: {
          id: transaction.id,
        },
        data: {
          status: isOverdraft ? "OVERDRAFT" : "ACCEPTED",
        },
      });
    } catch (err) {
      if (err instanceof runtime_1.PrismaClientKnownRequestError) {
        throw error_1.CustomError.badRequest();
      } else if (err instanceof error_1.CustomError) {
        throw err;
      } else {
        throw error_1.CustomError.internalServerError();
      }
    }
  });
}
exports.transaction = transaction;
function pay(input) {
  return __awaiter(this, void 0, void 0, function* () {
    return yield transaction(input);
  });
}
exports.pay = pay;
function getTransactions(input) {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      const user = yield client_1.default.user.findUnique({
        where: {
          id: input.userId,
        },
      });
      if (!user) {
        throw error_1.CustomError.notFound("User not found");
      }
      const transactions = yield client_1.default.transaction.findMany({
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
      if (err instanceof runtime_1.PrismaClientKnownRequestError) {
        throw error_1.CustomError.badRequest();
      } else if (err instanceof error_1.CustomError) {
        throw err;
      } else {
        throw error_1.CustomError.internalServerError();
      }
    }
  });
}
exports.getTransactions = getTransactions;
function creditCardTransaction(input) {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      const creditCard = yield client_1.default.account.findUnique({
        where: {
          credit_card: input.creditCardId,
        },
        include: {
          user: true,
        },
      });
      if (!creditCard) {
        throw error_1.CustomError.notFound("Credit card not found");
      }
      const user = yield client_1.default.user.findUnique({
        where: {
          id: input.recipientId,
        },
        include: {
          account: true,
        },
      });
      if (!user) {
        throw error_1.CustomError.notFound("User not found");
      }
      const transaction = yield client_1.default.transaction.create({
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
          yield client_1.default.transaction.update({
            where: {
              id: transaction.id,
            },
            data: {
              status: "REFUSED",
            },
          });
          yield client_1.default.user.update({
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
          throw error_1.CustomError.forbidden("Amount exceeds max overdraft");
        }
        isOverdraft = true;
      }
      yield client_1.default.account.update({
        where: {
          user_id: creditCard.user_id,
        },
        data: {
          balance: {
            decrement: input.amount,
          },
        },
      });
      yield client_1.default.account.update({
        where: {
          user_id: user.id,
        },
        data: {
          balance: {
            increment: input.amount,
          },
        },
      });
      yield client_1.default.transaction.update({
        where: {
          id: transaction.id,
        },
        data: {
          status: isOverdraft ? "OVERDRAFT" : "ACCEPTED",
        },
      });
      return transaction;
    } catch (err) {
      if (err instanceof runtime_1.PrismaClientKnownRequestError) {
        throw error_1.CustomError.badRequest();
      } else if (err instanceof error_1.CustomError) {
        throw err;
      } else {
        throw error_1.CustomError.internalServerError();
      }
    }
  });
}
exports.creditCardTransaction = creditCardTransaction;
exports.default = {
  transaction,
  pay,
  getTransactions,
  creditCardTransaction,
};
