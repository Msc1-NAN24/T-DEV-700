import express from "express";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { PrismaClient } from "@prisma/client";
import productRouter from "./router/productRouter";
import userRouter from "./router/userRouter";
import orderRouter from "./router/orderRouter";
import authRouter from "./router/authRouter";

const appEnv = dotenv.config();
dotenvExpand.expand(appEnv);

export const prisma = new PrismaClient();

const app = express();

app.use(express.json());
app.use("/user", userRouter);
app.use("/product", productRouter);
app.use("/order", orderRouter);
app.use("/auth", authRouter);
app.listen(process.env.APP_PORT, () => {
  console.log("Example app listening on port 3000!");
});
