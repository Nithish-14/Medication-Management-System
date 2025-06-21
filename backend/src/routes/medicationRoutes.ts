import express from "express";
import { addMedication, getMedications, markAsTaken, getMonthlyLogStatus, getDailyMedicationStatus, getMedicationStats, deleteMedication, getAllPatients, getRecentMedicationActivity } from "../controllers/medicationController";
import { authenticateJWT } from "../middleware/authMiddleware";
import upload from "../middleware/upload";

export default function(io: any) {
  const router = express.Router();

  router.post("/add", authenticateJWT, addMedication);
  router.get("/", authenticateJWT, getMedications);
  router.post("/mark", authenticateJWT, upload.single("photo"), (req, res) => markAsTaken(req, res, io));
  router.get('/calendar/monthly', authenticateJWT, getMonthlyLogStatus);
  router.get("/daily-status", authenticateJWT, getDailyMedicationStatus);
  router.get("/stats", authenticateJWT, getMedicationStats);
  router.delete("/delete", authenticateJWT, deleteMedication)
  router.get("/caretaker/patients", authenticateJWT, getAllPatients);
  router.get("/recent", authenticateJWT, getRecentMedicationActivity)

  return router;
}
