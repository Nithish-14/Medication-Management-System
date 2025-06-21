import {Response} from 'express'

import { AuthRequest } from '../middleware/authMiddleware';

export const getStats = (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return res.json({ userId, streak: 5 });
};