"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const accounts_1 = __importDefault(require("./routes/accounts"));
const authentication_1 = __importDefault(require("./routes/authentication"));
const transactions_1 = __importDefault(require("./routes/transactions"));
const users_1 = __importDefault(require("./routes/users"));
const api = (0, express_1.Router)();
api.use(authentication_1.default);
api.use(users_1.default);
api.use(accounts_1.default);
api.use(transactions_1.default);
exports.default = api;
