// src/models/db.ts
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export const initDB = async () => {
  const db = await open({
    filename: "./medication.db",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('patient', 'caretaker'))
    );

    CREATE TABLE IF NOT EXISTS medications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      frequency TEXT NOT NULL,
      FOREIGN KEY(userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS medication_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      medicationId INTEGER,
      date TEXT NOT NULL,
      photo TEXT,    
      FOREIGN KEY (medicationId) REFERENCES medications(id),
      UNIQUE(medicationId, date) -- only one log per medication per day
    );

    CREATE TABLE IF NOT EXISTS daily_completion (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      date TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      UNIQUE(userId, date),
      FOREIGN KEY (userId) REFERENCES users(id)
    );


  `);

  console.log("Database initialized.");
  return db;
};
