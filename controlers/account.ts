import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Account, AccountRole } from "../db/entity/Account.js";
import { AuthRequest } from "../middleware/auth.js";

const SALT_ROUNDS = 10;

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password) {
            res.status(400).json({ message: "Username and password are required" });
            return;
        }

        const validRoles = Object.values(AccountRole);
        if (role && !validRoles.includes(role)) {
            res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(", ")}` });
            return;
        }

        const existing = await Account.findOneBy({ username });
        if (existing) {
            res.status(409).json({ message: "Username already exists" });
            return;
        }

        const hashed = await bcrypt.hash(password, SALT_ROUNDS);
        const account = new Account();
        account.username = username;
        account.password = hashed;
        account.role = role || AccountRole.VIEWER;

        await account.save();

        res.status(201).json({
            id: account.id,
            username: account.username,
            role: account.role,
            active: account.active,
            createdAt: account.createdAt,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ message: "Username and password are required" });
            return;
        }

        const account = await Account.findOneBy({ username });
        if (!account) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }

        if (!account.active) {
            res.status(403).json({ message: "Account is disabled" });
            return;
        }

        const isMatch = await bcrypt.compare(password, account.password);
        if (!isMatch) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }

        const secret = process.env.JWT_SECRET!;
        const token = jwt.sign(
            { id: account.id, username: account.username, role: account.role },
            secret,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            account: {
                id: account.id,
                username: account.username,
                role: account.role,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const account = await Account.findOneBy({ id: req.account!.id });
        if (!account) {
            res.status(404).json({ message: "Account not found" });
            return;
        }
        res.json({
            id: account.id,
            username: account.username,
            role: account.role,
            active: account.active,
            createdAt: account.createdAt,
        });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const getAllAccounts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const accounts = await Account.find({ select: ["id", "username", "role", "active", "createdAt"] });
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const updateAccount = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const account = await Account.findOneBy({ id });
        if (!account) {
            res.status(404).json({ message: "Account not found" });
            return;
        }

        if (req.body.role) {
            const validRoles = Object.values(AccountRole);
            if (!validRoles.includes(req.body.role)) {
                res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(", ")}` });
                return;
            }
            account.role = req.body.role;
        }

        if (typeof req.body.active === "boolean") {
            account.active = req.body.active;
        }

        if (req.body.password) {
            account.password = await bcrypt.hash(req.body.password, SALT_ROUNDS);
        }

        await account.save();
        res.json({
            id: account.id,
            username: account.username,
            role: account.role,
            active: account.active,
        });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (req.account!.id === id) {
            res.status(400).json({ message: "Cannot delete your own account" });
            return;
        }

        const account = await Account.findOneBy({ id });
        if (!account) {
            res.status(404).json({ message: "Account not found" });
            return;
        }

        await account.remove();
        res.json({ message: "Account deleted" });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};
