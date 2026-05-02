import express from "express";
import { login, register, getMe, getAllAccounts, updateAccount, deleteAccount } from "../controlers/account.js";
import { authenticate, adminOnly, anyRole } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login);

router.get("/me", authenticate, anyRole, getMe);

router.post("/register", authenticate, adminOnly, register);

router.get("/", authenticate, adminOnly, getAllAccounts);

router.put("/:id", authenticate, adminOnly, updateAccount);

router.delete("/:id", authenticate, adminOnly, deleteAccount);

export default router;
