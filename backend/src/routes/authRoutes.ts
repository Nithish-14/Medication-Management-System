import express from "express";
import { signup, login, verifyToken, verifyUser } from "../controllers/authController";
import { authenticateJWT } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/verify", authenticateJWT, verifyToken);
router.get("/verify/user", authenticateJWT, verifyUser)

export default router;
