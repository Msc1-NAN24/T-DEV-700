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
exports.addCreditCard = exports.updateAccount = exports.getAccount = void 0;
const runtime_1 = require("@prisma/client/runtime");
const client_1 = __importDefault(require("../client"));
const error_1 = require("../types/error");
function getAccount(userId) {
  var _a;
  return __awaiter(this, void 0, void 0, function* () {
    try {
      const account =
        (_a = yield client_1.default.account.findUnique({
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
        })) !== null && _a !== void 0
          ? _a
          : yield client_1.default.account.create({
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
            });
      if (account) {
        return account;
      } else {
        throw error_1.CustomError.notFound("Account not found");
      }
    } catch (error) {
      if (error instanceof error_1.CustomError) {
        throw error;
      } else if (error instanceof runtime_1.PrismaClientKnownRequestError) {
        switch (error.code) {
          case "P2025":
            throw error_1.CustomError.badRequest("User not found");
          default:
            throw error_1.CustomError.internalServerError();
        }
      } else {
        throw error_1.CustomError.internalServerError();
      }
    }
  });
}
exports.getAccount = getAccount;
function updateAccount(userId, input) {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      const account = yield client_1.default.account.update({
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
        throw error_1.CustomError.notFound("Account not found");
      }
    } catch (error) {
      if (error instanceof error_1.CustomError) {
        throw error;
      } else if (error instanceof runtime_1.PrismaClientKnownRequestError) {
        switch (error.code) {
          case "P2025":
            throw error_1.CustomError.badRequest("User not found");
          default:
            throw error_1.CustomError.internalServerError();
        }
      } else {
        throw error_1.CustomError.internalServerError();
      }
    }
  });
}
exports.updateAccount = updateAccount;
function addCreditCard(userId, cardId) {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      const account = yield client_1.default.account.update({
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
        throw error_1.CustomError.notFound("Account not found");
      }
    } catch (error) {
      if (error instanceof error_1.CustomError) {
        throw error;
      } else if (error instanceof runtime_1.PrismaClientKnownRequestError) {
        switch (error.code) {
          case "P2025":
            throw error_1.CustomError.badRequest("User not found");
          default:
            throw error_1.CustomError.internalServerError();
        }
      } else {
        throw error_1.CustomError.internalServerError();
      }
    }
  });
}
exports.addCreditCard = addCreditCard;
exports.default = {
  getAccount,
  updateAccount,
  addCreditCard,
};
