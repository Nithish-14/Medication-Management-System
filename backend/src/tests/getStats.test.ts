import { describe, it, expect, vi } from 'vitest';
import { getStats } from '../utils/getStats';

describe('getStats handler', () => {
  it('returns stats for authenticated user', () => {
    const req = { user: { id: 1 } };
    const res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };

    getStats(req, res);
    expect(res.json).toHaveBeenCalledWith({ userId: 1, streak: 5 });
  });

  it('returns 401 if user is not authenticated', () => {
    const req = {};
    const res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };

    getStats(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });
});
