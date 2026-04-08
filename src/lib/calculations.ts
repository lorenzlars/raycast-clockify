import { ClockifyTimeEntry, HoursReport } from "./types";
import { FederalState, getHolidaysInRange } from "./holidays";

export function countWorkdays(
  start: Date,
  end: Date,
  holidays?: Date[],
): number {
  const holidaySet = new Set(
    (holidays ?? []).map((d) => {
      const h = new Date(d);
      h.setHours(0, 0, 0, 0);
      return h.getTime();
    }),
  );

  let count = 0;
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(0, 0, 0, 0);

  while (current <= endDate) {
    const day = current.getDay();
    if (day !== 0 && day !== 6 && !holidaySet.has(current.getTime())) count++;
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
  state?: FederalState,
  extraDaysOff = 0,
): HoursReport {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  let totalMs = 0;
  let todayMs = 0;
  for (const entry of entries) {
    const start = new Date(entry.timeInterval.start);
    const end = entry.timeInterval.end ? new Date(entry.timeInterval.end) : now;
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

  const holidaysInRange = state
    ? getHolidaysInRange(earliest, now, state).filter((h) => {
        const day = h.getDay();
        return day !== 0 && day !== 6;
      })
    : [];
  const workdays = countWorkdays(earliest, now, holidaysInRange) - extraDaysOff;
  const expectedHours = workdays * hoursPerDay;
  const balanceHours = actualHours - expectedHours;

  return {
    periodStart: earliest,
    periodEnd: now,
    workdays,
    holidays: holidaysInRange.length,
    extraDaysOff,
    expectedHours,
    actualHours,
    balanceHours,
    todayHours,
  };
}
