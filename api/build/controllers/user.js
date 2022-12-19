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
exports.updatePassword = exports.remove = exports.update = exports.get = void 0;
const runtime_1 = require("@prisma/client/runtime");
const bcrypt_1 = __importDefault(require("bcrypt"));
const error_1 = require("../types/error");
const client_1 = __importDefault(require("../client"));
function get(userId) {
  return __awaiter(this, void 0, void 0, function* () {
    if (!userId) {
      throw error_1.CustomError.badRequest("Invalid user ID");
    }
    try {
      const user = yield client_1.default.user.findUnique({
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
        throw error_1.CustomError.notFound("User not found");
      }
      return user;
    } catch (error) {
      if (error instanceof runtime_1.PrismaClientKnownRequestError) {
        throw error_1.CustomError.databaseError(error.message);
      } else if (error instanceof error_1.CustomError) {
        throw error;
      } else {
        throw error_1.CustomError.internalServerError();
      }
    }
  });
}
exports.get = get;
function update(userId, data) {
  return __awaiter(this, void 0, void 0, function* () {
    if (!userId) {
      throw error_1.CustomError.badRequest("Invalid user ID");
    }
    try {
      const user = yield client_1.default.user.update({
        data,
        where: {
          id: userId,
        },
      });
      return user;
    } catch (error) {
      if (error instanceof runtime_1.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw error_1.CustomError.conflict(
            "Username or email already in use"
          );
        } else if (error.code === "P2025") {
          throw error_1.CustomError.notFound("User not found");
        } else throw error_1.CustomError.databaseError(error.message);
      } else if (error instanceof error_1.CustomError) {
        throw error;
      } else {
        throw error_1.CustomError.internalServerError();
      }
    }
  });
}
exports.update = update;
function remove(userId) {
  return __awaiter(this, void 0, void 0, function* () {
    if (!userId) {
      throw error_1.CustomError.badRequest("Invalid user ID");
    }
    try {
      const user = yield client_1.default.user.delete({
        where: {
          id: userId,
        },
      });
      return user;
    } catch (error) {
      if (error instanceof runtime_1.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw error_1.CustomError.notFound("User not found");
        } else throw error_1.CustomError.databaseError(error.message);
      } else if (error instanceof error_1.CustomError) {
        throw error;
      } else {
        throw error_1.CustomError.internalServerError();
      }
    }
  });
}
exports.remove = remove;
function updatePassword(userId, oldPassword, newPassword) {
  return __awaiter(this, void 0, void 0, function* () {
    if (!userId || !oldPassword || !newPassword) {
      throw error_1.CustomError.badRequest("Invalid password data");
    }
    try {
      const user = yield client_1.default.user.findUnique({
        select: {
          id: true,
          password: true,
        },
        where: {
          id: userId,
        },
      });
      if (!user) {
        throw error_1.CustomError.notFound("User not found");
      }
      if (!(yield bcrypt_1.default.compare(oldPassword, user.password))) {
        throw error_1.CustomError.badRequest("Invalid password");
      }
      const password = yield bcrypt_1.default.hash(newPassword, 10);
      yield client_1.default.user.update({
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
      if (error instanceof runtime_1.PrismaClientKnownRequestError) {
        throw error_1.CustomError.databaseError(error.message);
      } else if (error instanceof error_1.CustomError) {
        throw error;
      } else {
        throw error_1.CustomError.internalServerError();
      }
    }
  });
}
exports.updatePassword = updatePassword;
exports.default = {
  get,
  update,
  remove,
  updatePassword,
};
