import { Router } from "express";

import accounts from "./routes/accounts";
import auth from "./routes/authentication";
import transactions from "./routes/transactions";
import users from "./routes/users";

const api = Router();

api.use(auth);
api.use(users);
api.use(accounts);
api.use(transactions);

export default api;
