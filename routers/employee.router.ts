import express from "express";
import { login, register, getMe, getAllEmployees, updateEmployee, deleteEmployee, changeMyPassword } from "../controlers/employee.js";
import { authenticate, adminOnly, anyRole } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login);

router.get("/me", authenticate, anyRole, getMe);

router.put("/me/password", authenticate, anyRole, changeMyPassword);

router.post("/register", authenticate, adminOnly, register);

router.get("/", authenticate, adminOnly, getAllEmployees);

router.put("/:id", authenticate, adminOnly, updateEmployee);

router.delete("/:id", authenticate, adminOnly, deleteEmployee);

export default router;
