import {Response, NextFunction} from 'express'

import { AuthRequest } from '../middleware/authMiddleware';

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  next();
};
