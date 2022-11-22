import { Router } from "express";
import auth from "./routes/authentication";
import user from "./routes/user";

const api = Router();

api.use("/", auth);
api.use("/users", user);

export default api;
