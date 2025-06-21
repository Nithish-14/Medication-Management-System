export function calculateStreak(dates: string[], today: string): number {
  let streak = 0;
  const dateSet = new Set(dates);
  let current = new Date(today);

  while (true) {
    const dateStr = current.toISOString().split("T")[0];
    if (dateSet.has(dateStr)) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
