import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel";
import { JWT_SECRET } from "../config";

export interface AuthRequest extends Request {
  freelancer?: any;
}

export const authenticateMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const freelancer = await User.findById(decoded.id);

    if (!freelancer) {
      return res.status(404).json({ message: "freelancer not found" });
    }
    req.freelancer = freelancer;

    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};