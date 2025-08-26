import bcrypt from "bcryptjs";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

declare module "express-session" {
  interface SessionData {
    userId?: number;
    userEmail?: string;
  }
}

export function getSession() {
  // Use memory store for development, will switch to PG store for production
  return session({
    secret: process.env.SESSION_SECRET || "facebook-boost-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    rolling: true, // Extend session on each request
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days for persistent login
      sameSite: 'lax'
    },
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  console.log('Session check:', req.session?.userId); // Debug log
  if (req.session?.userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}