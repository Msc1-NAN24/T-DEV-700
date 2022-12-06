import express from "express";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import productRouter from "./router/productRouter";
import userRouter from "./router/userRouter";

const appEnv = dotenv.config();
dotenvExpand.expand(appEnv);

const app = express();

app.use(express.json());
app.use("/user", userRouter);
app.use("/product", productRouter);
app.listen(process.env.APP_PORT, () => {
  console.log("Example app listening on port 3000!");
});
