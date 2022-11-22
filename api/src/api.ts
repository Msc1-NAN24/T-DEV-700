import { Router } from "express";
import auth from "./routes/authentication";
import users from "./routes/users";
import accounts from "./routes/accounts";
import transactions from "./routes/transactions";

const api = Router();

api.use(auth);
api.use(users);
api.use(accounts);
api.use(transactions);

export default api;
