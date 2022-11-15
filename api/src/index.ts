import express from "express";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

const appEnv = dotenv.config();
dotenvExpand.expand(appEnv);

const app = express();
/**
 * @type void
 * @return {number}
 */
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(process.env.APP_PORT, () => {
  console.log("Example app listening on port 3000!");
});
