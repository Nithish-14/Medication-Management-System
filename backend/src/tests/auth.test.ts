import { describe, it, expect, vi } from 'vitest';
import { requireAuth } from '../utils/auth';

describe('requireAuth middleware', () => {
  it('calls next if user is authenticated', () => {
    const req = { user: { id: 1 } };
    const res = {};
    const next = vi.fn();

    requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 401 if user not authenticated', () => {
    const req = {};
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    const next = vi.fn();

    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });
});
