import { describe, it, expect } from 'vitest';
import { calculateStreak } from '../utils/medication';

describe('calculateStreak', () => {
  it('should return correct streak count', () => {
    const takenDates = ["2025-06-18", "2025-06-19", "2025-06-20"];
    const today = "2025-06-20";
    expect(calculateStreak(takenDates, today)).toBe(3);
  });

  it('should stop streak if today is not taken', () => {
    const takenDates = ["2025-06-18", "2025-06-19"];
    const today = "2025-06-20";
    expect(calculateStreak(takenDates, today)).toBe(0);
  });
});
