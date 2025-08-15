import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./config";

interface TokenPayload extends JwtPayload {
    userId: string
}

export default function middleware(req: Request, res: Response, next: NextFunction) {
    try {

        const token = req.headers["authorization"] ?? "";

        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

        if (decoded && decoded.userId) {
            req.userId = decoded.userId;
            next();
        } else {
            res.status(403).json({
                message: "Invalid Token"
            })
        }

    } catch (err) {

        res.status(403).json({
            message: "Unauthorized"
        })

    }
}