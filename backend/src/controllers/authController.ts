import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { AuthRequest, authenticateJWT } from "../middleware/authMiddleware";

const DB_PATH = "./medication.db";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

const getDB = async () => await open({ filename: DB_PATH, driver: sqlite3.Database });

export const signup = async (req: Request, res: Response): Promise<any> => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) return res.status(400).json({ message: "All fields required" });

  try {
    const db = await getDB();
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.run(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, role]
    );

    res.status(201).json({ message: "User registered" });
  } catch (err: any) {
    if (err.code === "SQLITE_CONSTRAINT") {
      return res.status(409).json({ message: "Username already exists" });
    }
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const db = await getDB();
    const user = await db.get("SELECT * FROM users WHERE username = ? and role = ?", [
      username, role
    ]);

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "3d" }
    );

    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err: any) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

export const verifyToken = (req: AuthRequest, res: Response) => {
  res.send(req.user);
}

export const verifyUser = async (req: AuthRequest, res: Response) => {
  try {
    const {userId} = req.query;

    const db = await getDB();
    const user = await db.get("SELECT * FROM users WHERE id = ?", [
      userId
    ]);

    if (!user) {
      res.status(401).json({ message: "Invalid User Id" });
      return;
    }

    res.json({userId: user.id})
  } catch(err: any) {
      res.status(500).json({ message: "User Verification Failed", error: err.message });
  }
}
