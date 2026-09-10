export function recentReviewTrips(plans, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - 30);
  return plans.filter((plan) => {
    const end = plan.dateRange?.end;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(end || "")) return false;
    const date = new Date(`${end}T00:00:00`);
    return date >= cutoff;
  }).sort((a, b) => b.dateRange.end.localeCompare(a.dateRange.end));
}
