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
exports.login = exports.register = void 0;
const runtime_1 = require("@prisma/client/runtime");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = __importDefault(require("../client"));
const error_1 = require("../types/error");
function register(input) {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      const {
        first_name,
        last_name,
        username,
        email,
        password,
        confirm_password,
      } = input;
      if (password !== confirm_password) {
        throw error_1.CustomError.badRequest("Passwords do not match");
      }
      const user = yield client_1.default.user.create({
        data: {
          first_name,
          last_name,
          username,
          email,
          password: yield bcrypt_1.default.hash(password, 10),
          account: {
            create: {},
          },
        },
      });
      const token = jsonwebtoken_1.default.sign(
        {
          userId: user.id,
          username: user.username,
          admin: user.is_admin,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );
      return { token };
    } catch (error) {
      if (error instanceof runtime_1.PrismaClientKnownRequestError) {
        switch (error.code) {
          case "P2002":
            throw error_1.CustomError.conflict(
              "Username or email already exists"
            );
          default:
            throw error_1.CustomError.internalServerError();
        }
      } else if (error instanceof error_1.CustomError) {
        throw error;
      } else {
        throw error_1.CustomError.internalServerError();
      }
    }
  });
}
exports.register = register;
function login(input) {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      const { username, password } = input;
      const user = yield client_1.default.user.findUnique({
        where: {
          username,
        },
      });
      if (!user) {
        throw error_1.CustomError.credentialsError();
      }
      if (!bcrypt_1.default.compareSync(password, user.password)) {
        throw error_1.CustomError.credentialsError();
      }
      const token = jsonwebtoken_1.default.sign(
        {
          userId: user.id,
          username: user.username,
          admin: user.is_admin,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );
      return { token };
    } catch (error) {
      if (error instanceof runtime_1.PrismaClientKnownRequestError) {
        switch (error.code) {
          case "P2025":
            throw error_1.CustomError.badRequest("User not found");
          default:
            throw error_1.CustomError.internalServerError();
        }
      } else if (error instanceof error_1.CustomError) {
        throw error;
      } else {
        throw error_1.CustomError.internalServerError();
      }
    }
  });
}
exports.login = login;
exports.default = {
  register,
  login,
};
