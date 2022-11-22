import express from "express";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

import api from "./api";

const appEnv = dotenv.config();
dotenvExpand.expand(appEnv);

const server = express();
server.use(express.json());

server.use("/api", api);

server.listen(process.env.APP_PORT, () => {
  console.log(`🚀 Server listening on port ${process.env.APP_PORT}`);
});
