"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const dotenv_expand_1 = __importDefault(require("dotenv-expand"));
const api_1 = __importDefault(require("./api"));
const appEnv = dotenv_1.default.config();
dotenv_expand_1.default.expand(appEnv);
const server = (0, express_1.default)();
server.use(express_1.default.json());
server.use("/api", api_1.default);
server.listen(process.env.APP_PORT, () => {
  console.log(`🚀 Server listening on port ${process.env.APP_PORT}`);
});
