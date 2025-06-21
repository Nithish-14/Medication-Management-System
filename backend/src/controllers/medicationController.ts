import { Request, Response } from "express";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { AuthRequest } from "../middleware/authMiddleware";
import advancedFormat from "dayjs/plugin/advancedFormat";
dayjs.extend(isoWeek);
dayjs.extend(isSameOrBefore);
dayjs.extend(advancedFormat);

const DB_PATH = "./medication.db";
const getDB = async () => open({ filename: DB_PATH, driver: sqlite3.Database });

export const getAllPatients = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user || user.role !== "caretaker") {
      res.status(403).json({ message: "Access denied. Only caretakers can view patients." });
      return;
    }

    const db = await getDB();

    const patients = await db.all(`SELECT id, username, email FROM users WHERE role = ?`, ["patient"]);

    res.json(patients);
  } catch (err: any) {
    res.status(500).json({ message: "Failed to fetch patients", error: err.message });
  }
};

export const addMedication = async (req: AuthRequest, res: Response) => {
  const { userId, name, dosage, frequency } = req.body;

  if (!userId || !name || !dosage || !frequency) {
    res.status(400).json({ message: "Missing fields" });
    return;
  }

  try {
    const db = await getDB();
    await db.run(
      "INSERT INTO medications (userId, name, dosage, frequency) VALUES (?, ?, ?, ?)",
      [userId, name, dosage, frequency]
    );
    res.status(201).json({ message: "Medication added" });
  } catch (err: any) {
    res.status(500).json({ message: "Error adding medication", error: err.message });
  }
};

export const deleteMedication = async (req: AuthRequest, res: Response, io: any) => {
  const {medicationId} = req.body;

  try {
    const db = await getDB();
    await db.run(
      "DELETE FROM medications WHERE id = ?",[medicationId]
    );
    res.status(201).json({ message: "Medication deleted" });
  } catch (err: any) {
    res.status(500).json({ message: "Error deleting medication", error: err.message });
  }
}

export const getMedications = async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDB();
    const userId = req.user.role === "patient" ? req.user.id : req.query.userId;
    const date = new Date().toISOString().split("T")[0];
    // Get all medications
    const medications = await db.all(
      "SELECT * FROM medications WHERE userId = ?",
      [userId]
    );

    // For each med, check if it's taken
    const result = await Promise.all(
      medications.map(async (med) => {
        const takenLog = await db.get(
          `SELECT * FROM medication_logs WHERE medicationId = ? AND date = ?`,
          [med.id, date]
        );
        // console.log(takenLog.photo)
        return {
          id: med.id,
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          status: takenLog ? "taken" : "not_taken",
          // photo: takenLog && takenLog.photo ? `${req.protocol}://${req.get("host")}${takenLog.photo}` : null
          photo: (takenLog ? (takenLog.photo ? `${req.protocol}://${req.get("host")}${takenLog.photo}` : null) : null)
        };
      })
    );

    res.json({
      userId: req.user.id,
      date,
      medications: result,
    });
  } catch (err: any) {
    res.status(500).json({ message: "Error fetching meds", error: err.message });
  }
};

export const markAsTaken = async (req: AuthRequest, res: Response, io: any) => {
  const { medicationId, date } = req.body;
  const photoPath = req.file ? `/uploads/${req.file.filename}` : null;
  const userId = req.user.id

  try {
    const db = await getDB();
    await db.run(
      `INSERT OR REPLACE INTO medication_logs (userId, medicationId, date, photo) VALUES (?, ?, ?, ?)`,
      [userId, medicationId, date, photoPath]
    );

    // Emit real-time update
    // io.emit("medicationTaken", { medicationId, date });

    // Count total medications for user
    const totalMeds = await db.get(
      "SELECT COUNT(*) as total FROM medications WHERE userId = ?",
      [userId]
    );

    // Count medications marked taken on this date
    const takenMeds = await db.get(
      `SELECT COUNT(*) as taken FROM medication_logs 
      WHERE medicationId IN (SELECT id FROM medications WHERE userId = ?)
      AND date = ?`,
      [userId, date]
    );

    if (takenMeds.taken === totalMeds.total) {
      // All meds taken — update daily_completion
      await db.run(
        `INSERT OR REPLACE INTO daily_completion (userId, date, completed) VALUES (?, ?, 1)`,
        [userId, date]
      );
      res.json({ message: "Marked as taken", totalMedsTaken: true});
    } else {
      res.json({ message: "Marked as taken", totalMedsTaken: false});
    }
  } catch (err: any) {
    res.status(500).json({ message: "Error marking as taken", error: err.message });
  }
};


export const getMonthlyLogStatus = async (req: AuthRequest, res: Response) => {
  const { month } = req.query;
  const userId = req.user.role === "patient" ? req.user.id : req.query.userId;

  if (!month || !/^\d{4}-\d{2}$/.test(month as string)) {
    res.status(400).json({ message: "Invalid or missing month (use YYYY-MM)" });
    return;
  }

  try {
    const db = await getDB();
    const today = dayjs();
    const targetMonth = dayjs(`${month}-01`);

    if (!targetMonth.isValid()) {
      res.status(400).json({ message: "Invalid date" });
      return;
    }

    const isCurrentMonth = targetMonth.isSame(today, "month");
    const totalDays = targetMonth.daysInMonth();

    // Fetch all medication logs for that user in that month
    const logs = await db.all(
      `
      SELECT DISTINCT date FROM medication_logs 
      WHERE medicationId IN (
        SELECT id FROM medications WHERE userId = ?
      ) AND date LIKE ?
      `,
      [userId, `${month}%`]
    );

    const logDates = new Set(logs.map((row: any) => row.date));

    const dayStatus: Record<string, string> = {};

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${month}-${String(d).padStart(2, "0")}`;
      if (isCurrentMonth && d > today.date()) break;

      dayStatus[dateStr.split("-")[2]] = logDates.has(dateStr) ? "taken" : "not_taken";
    }
    

    res.json({
      userId,
      month,
      days: dayStatus
    });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch calendar status", error: error.message });
  }
};

export const getDailyMedicationStatus = async (req: AuthRequest, res: Response) => {
  const { date } = req.query;
  const userId = req.user.role === "patient" ? req.user.id : req.query.userId;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date as string)) {
    res.status(400).json({ message: "Invalid or missing date (use YYYY-MM-DD)" });
    return;
  }

  try {
    const db = await getDB();

    // Get all user's medications
    const medications = await db.all(
      `SELECT id, name, dosage, frequency FROM medications WHERE userId = ?`,
      [userId]
    );

    // Get logs for that date
    const logs = await db.all(
      `SELECT medicationId, photo FROM medication_logs WHERE date = ?`,
      [date]
    );

    const logMap = new Map<number, string | null>();
    logs.forEach((log: any) => {
      logMap.set(log.medicationId, log.photo);
    });

    const result = medications.map((med: any) => ({
      ...med,
      status: logMap.has(med.id) ? "taken" : "not_taken",
      photo: logMap.get(med.id) ? `${req.protocol}://${req.get("host")}${logMap.get(med.id)}` : null
    }));

    res.json({ date, medications: result });
  } catch (err: any) {
    res.status(500).json({ message: "Failed to fetch daily medication status", error: err.message });
  }
};

export const getMedicationStats = async (req: AuthRequest, res: Response) => {
  const userId = req.user.role === "patient" ? req.user.id : req.query.userId;
  const month = (req.query.month as string) || dayjs().format("YYYY-MM");

  if (!/^\d{4}-\d{2}$/.test(month)) {
    res.status(400).json({ message: "Invalid month format (YYYY-MM)" });
    return;
  }

  try {
    const db = await getDB();

    const today = dayjs();
    const todayStr = today.format("YYYY-MM-DD");
    const monthStart = dayjs(`${month}-01`);
    const monthEnd = monthStart.endOf("month");

    const user = await db.get(
      `SELECT * from users WHERE id = ?`, [userId]
    );

    // Get all log dates for the user
    const rows = await db.all(
      `SELECT DISTINCT date FROM medication_logs WHERE userId = ?`,
      [userId]
    );

    const logDates = new Set(rows.map((row: any) => row.date));

    const latestDay = logDates.has(todayStr) ? today : today.subtract(1, "day");

    // --- Current Streak ---
    let streak = 0;
    for (let d = latestDay; ; d = d.subtract(1, "day")) {
      const dateStr = d.format("YYYY-MM-DD");
      if (logDates.has(dateStr)) {
        streak++;
      } else {
        break;
      }
    }

    // --- Adherence Rate ---
    const firstLogDate = rows.length > 0 ? dayjs(rows[0].date) : latestDay;
    const totalDays = latestDay.diff(firstLogDate, "day") + 1;

    let takenDays = 0;
    for (let d = firstLogDate; d.isSameOrBefore(latestDay); d = d.add(1, "day")) {
      if (logDates.has(d.format("YYYY-MM-DD"))) {
        takenDays++;
      }
    }

    const adherenceRate = totalDays === 0 ? 0 : Math.round((takenDays / totalDays) * 100);

    // --- Monthly Rate ---
    let monthTaken = 0;
    for (
      let d = monthStart;
      d.isSameOrBefore(latestDay) && d.isSame(monthEnd, "month");
      d = d.add(1, "day")
    ) {
      if (logDates.has(d.format("YYYY-MM-DD"))) {
        monthTaken++;
      }
    }

    const daysInMonth = dayjs().isSame(monthStart, "month")
      ? latestDay.date()
      : monthStart.daysInMonth();

    const monthlyRate = Math.round((monthTaken / daysInMonth) * 100);

    // --- Taken This Week ---
    const weekStart = latestDay.startOf("isoWeek");
    let takenThisWeek = 0;
    for (let d = weekStart; d.isSameOrBefore(latestDay); d = d.add(1, "day")) {
      if (logDates.has(d.format("YYYY-MM-DD"))) {
        takenThisWeek++;
      }
    }

    res.json({
      email: user.email,
      username: user.username,
      currentStreak: streak,
      adherenceRate,
      monthlyRate,
      takenThisWeek
    });
  } catch (err: any) {
    res.status(500).json({ message: "Failed to compute stats", error: err.message });
  }
};

export const getRecentMedicationActivity = async (req: AuthRequest, res: Response) => {
  const { userId } = req.query;

  try {
    const db = await getDB();

    // Latest 5 medication logs for the user
    const logs = await db.all(
      `SELECT date, photo
       FROM medication_logs
       WHERE userId = ?
       ORDER BY date DESC
       LIMIT 5`,
      [userId]
    );

    const formatted = logs.map((log: any) => {
      const date = dayjs(log.date).format("dddd, MMMM D"); // e.g., Monday, June 10
      const time = "8:00 AM";

      return {
        date,
        time,
        photo: log.photo || null,
        status: "Completed",
      };
    });

    res.json(formatted);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch recent activity", error: err.message });
  }
};
