import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { EmployeeRole } from "../db/entity/Employee.js";

export interface AuthRequest extends Request {
    employee?: {
        id: string;
        username: string;
        role: EmployeeRole;
    };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "No token provided" });
        return;
    }

    const token = authHeader.split(" ")[1];
    try {
        const secret = process.env.JWT_SECRET!;
        const decoded = jwt.verify(token, secret) as { id: string; username: string; role: EmployeeRole };
        req.employee = decoded;
        next();
    } catch {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

export const authorize = (...roles: EmployeeRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.employee) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        if (!roles.includes(req.employee.role)) {
            res.status(403).json({ message: "Forbidden: insufficient permissions" });
            return;
        }
        next();
    };
};

export const adminOnly = authorize(EmployeeRole.ADMIN);
export const editorOrAdmin = authorize(EmployeeRole.ADMIN, EmployeeRole.EDITOR);
export const anyRole = authorize(EmployeeRole.ADMIN, EmployeeRole.EDITOR, EmployeeRole.VIEWER);

export const writeProtect = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const writeMethods = ["POST", "PUT", "PATCH", "DELETE"];
    if (writeMethods.includes(req.method)) {
        return editorOrAdmin(req, res, next);
    }
    return anyRole(req, res, next);
};
