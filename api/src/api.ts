import { Router } from "express";
import user from "./endpoints/user";

const api = Router();

api.use("/user", user);

export default user;
