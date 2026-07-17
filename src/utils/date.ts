/** All date-only values in this app are plain `YYYY-MM-DD` strings, compared/manipulated in local time. */

export function todayISODate(): string {
  return toISODate(new Date());
}

export function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addMonthsToISODate(isoDate: string, months: number): string {
  const d = parseISODate(isoDate);
  const targetMonth = d.getMonth() + months;
  const result = new Date(d.getFullYear(), targetMonth, 1);
  const daysInTargetMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(d.getDate(), daysInTargetMonth));
  return toISODate(result);
}

export function addDaysToISODate(isoDate: string, days: number): string {
  const d = parseISODate(isoDate);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** Number of calendar days from `today` to `isoDate` (positive = future, negative = past). */
export function daysBetween(fromISODate: string, toISODateStr: string): number {
  const from = parseISODate(fromISODate);
  const to = parseISODate(toISODateStr);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((to.getTime() - from.getTime()) / msPerDay);
}

export function formatDateDisplay(isoDate: string): string {
  const d = parseISODate(isoDate);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function nowISOTimestamp(): string {
  return new Date().toISOString();
}
