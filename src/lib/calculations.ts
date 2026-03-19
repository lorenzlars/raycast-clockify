import { ClockifyTimeEntry, HoursReport } from "./types";

export function countWorkdays(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(0, 0, 0, 0);

  while (current <= endDate) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }

  return count;
}

export function formatHours(totalHours: number): string {
  const sign = totalHours < 0 ? "-" : "+";
  const abs = Math.abs(totalHours);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  return `${sign}${String(h).padStart(3, " ")}:${String(m).padStart(2, "0")}`;
}

export function formatHoursUnsigned(totalHours: number): string {
  const abs = Math.abs(totalHours);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  return `${String(h).padStart(3, " ")}:${String(m).padStart(2, "0")}`;
}

export function formatHoursCompact(totalHours: number): string {
  const sign = totalHours < 0 ? "-" : "+";
  const abs = Math.abs(totalHours);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  return `${sign}${h}:${String(m).padStart(2, "0")}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function calculateReport(
  entries: ClockifyTimeEntry[],
  hoursPerDay: number,
): HoursReport {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  let totalMs = 0;
  let todayMs = 0;
  for (const entry of entries) {
    const start = new Date(entry.timeInterval.start);
    const end = entry.timeInterval.end
      ? new Date(entry.timeInterval.end)
      : now;
    const durationMs = end.getTime() - start.getTime();
    totalMs += durationMs;
    if (start >= todayStart) {
      todayMs += durationMs;
    }
  }
  const actualHours = totalMs / (1000 * 60 * 60);
  const todayHours = todayMs / (1000 * 60 * 60);

  const starts = entries.map((e) => new Date(e.timeInterval.start));
  const earliest = new Date(Math.min(...starts.map((d) => d.getTime())));

  const workdays = countWorkdays(earliest, now);
  const expectedHours = workdays * hoursPerDay;
  const balanceHours = actualHours - expectedHours;

  return {
    periodStart: earliest,
    periodEnd: now,
    workdays,
    expectedHours,
    actualHours,
    balanceHours,
    todayHours,
  };
}
