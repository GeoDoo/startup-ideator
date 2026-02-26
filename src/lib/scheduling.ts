export function computeNextDue(frequency: string): Date {
  const now = new Date();
  switch (frequency) {
    case "weekly":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "biweekly":
      return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    case "quarterly":
      return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
    case "semi-annually":
      return new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());
    case "monthly":
    default:
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }
}
