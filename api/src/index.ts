import express from "express";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

const appEnv = dotenv.config();
dotenvExpand.expand(appEnv);

const server = express();
server.use(express.json());

import api from "./api";
server.use("/api", api);

server.get("/", (req, res) => {
  res.send("Hello World!");
});

server.listen(process.env.APP_PORT, () => {
  console.log(`🚀 Server listening on port ${process.env.APP_PORT}`);
});
