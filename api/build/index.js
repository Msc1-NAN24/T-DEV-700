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
const appEnv = dotenv_1.default.config();
dotenv_expand_1.default.expand(appEnv);
const app = (0, express_1.default)();
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.listen(process.env.APP_PORT, () => {
  console.log("Example app listening on port 3000!");
});
