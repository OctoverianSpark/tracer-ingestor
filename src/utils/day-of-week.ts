const DAY_LETTERS = ["D", "L", "M", "X", "J", "V", "S"]; // índice = Date.getUTCDay()

export function parseDateOnly(date: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) throw new Error(`Invalid date: ${date}`);
  const [, year, month, day] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}

export function getDayOfWeekLetter(date: Date): string {
  return DAY_LETTERS[date.getUTCDay()]!;
}

export function diffInDays(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / 86400000);
}
