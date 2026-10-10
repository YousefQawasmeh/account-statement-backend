import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Employee, EmployeeRole } from "../db/entity/Employee.js";
import { AuthRequest } from "../middleware/auth.js";

const SALT_ROUNDS = 10;

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password) {
            res.status(400).json({ message: "Username and password are required" });
            return;
        }

        const validRoles = Object.values(EmployeeRole);
        if (role && !validRoles.includes(role)) {
            res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(", ")}` });
            return;
        }

        const existing = await Employee.findOneBy({ username });
        if (existing) {
            res.status(409).json({ message: "Username already exists" });
            return;
        }

        const hashed = await bcrypt.hash(password, SALT_ROUNDS);
        const employee = new Employee();
        employee.username = username;
        employee.password = hashed;
        employee.role = role || EmployeeRole.VIEWER;

        await employee.save();

        res.status(201).json({
            id: employee.id,
            username: employee.username,
            role: employee.role,
            active: employee.active,
            createdAt: employee.createdAt,
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

        const employee = await Employee.findOneBy({ username });
        if (!employee) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }

        if (!employee.active) {
            res.status(403).json({ message: "Employee is disabled" });
            return;
        }

        const isMatch = await bcrypt.compare(password, employee.password);
        if (!isMatch) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }

        const secret = process.env.JWT_SECRET!;
        const token = jwt.sign(
            { id: employee.id, username: employee.username, role: employee.role },
            secret,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            employee: {
                id: employee.id,
                username: employee.username,
                role: employee.role,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const employee = await Employee.findOneBy({ id: req.employee!.id });
        if (!employee) {
            res.status(404).json({ message: "Employee not found" });
            return;
        }
        res.json({
            id: employee.id,
            username: employee.username,
            role: employee.role,
            active: employee.active,
            createdAt: employee.createdAt,
        });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const getAllEmployees = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const employees = await Employee.find({ select: ["id", "username", "role", "active", "createdAt"] });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const updateEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const employee = await Employee.findOneBy({ id });
        if (!employee) {
            res.status(404).json({ message: "Employee not found" });
            return;
        }

        if (req.body.role) {
            const validRoles = Object.values(EmployeeRole);
            if (!validRoles.includes(req.body.role)) {
                res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(", ")}` });
                return;
            }
            employee.role = req.body.role;
        }

        if (typeof req.body.active === "boolean") {
            employee.active = req.body.active;
        }

        if (req.body.password) {
            employee.password = await bcrypt.hash(req.body.password, SALT_ROUNDS);
        }

        await employee.save();
        res.json({
            id: employee.id,
            username: employee.username,
            role: employee.role,
            active: employee.active,
        });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const changeMyPassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            res.status(400).json({ message: "currentPassword and newPassword are required" });
            return;
        }

        if (newPassword.length < 6) {
            res.status(400).json({ message: "New password must be at least 6 characters" });
            return;
        }

        const employee = await Employee.findOneBy({ id: req.employee!.id });
        if (!employee) {
            res.status(404).json({ message: "Employee not found" });
            return;
        }

        const isMatch = await bcrypt.compare(currentPassword, employee.password);
        if (!isMatch) {
            res.status(401).json({ message: "Current password is incorrect" });
            return;
        }

        employee.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await employee.save();

        res.json({ message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const deleteEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (req.employee!.id === id) {
            res.status(400).json({ message: "Cannot delete your own employee" });
            return;
        }

        const employee = await Employee.findOneBy({ id });
        if (!employee) {
            res.status(404).json({ message: "Employee not found" });
            return;
        }

        await employee.remove();
        res.json({ message: "Employee deleted" });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};
