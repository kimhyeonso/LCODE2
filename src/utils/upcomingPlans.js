const calendarDay = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? timestamp : null;
};

export function getUpcomingPlans(plans, now = new Date()) {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return plans.flatMap((plan) => {
    const start = calendarDay(plan.dateRange?.start);
    if (start === null || start < today) return [];
    return [{ plan, dDay: (start - today) / 86400000 }];
  }).sort((a, b) => a.dDay - b.dDay).slice(0, 5);
}
