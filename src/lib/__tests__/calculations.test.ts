import { describe, it, expect, vi, afterEach } from "vitest";
import {
  countWorkdays,
  formatHours,
  formatHoursUnsigned,
  formatHoursCompact,
  formatDate,
  calculateReport,
} from "../calculations";
import { ClockifyTimeEntry } from "../types";

describe("countWorkdays", () => {
  it("counts weekdays in a full week", () => {
    // Mon 2025-01-06 to Fri 2025-01-10
    expect(countWorkdays(new Date("2025-01-06"), new Date("2025-01-10"))).toBe(
      5,
    );
  });

  it("excludes weekends", () => {
    // Mon 2025-01-06 to Sun 2025-01-12 (full week including weekend)
    expect(countWorkdays(new Date("2025-01-06"), new Date("2025-01-12"))).toBe(
      5,
    );
  });

  it("returns 1 for a single weekday", () => {
    const mon = new Date("2025-01-06");
    expect(countWorkdays(mon, mon)).toBe(1);
  });

  it("returns 0 for a single weekend day", () => {
    const sat = new Date("2025-01-04");
    expect(countWorkdays(sat, sat)).toBe(0);
  });

  it("counts across multiple weeks", () => {
    // Mon 2025-01-06 to Fri 2025-01-17 (2 full work weeks)
    expect(countWorkdays(new Date("2025-01-06"), new Date("2025-01-17"))).toBe(
      10,
    );
  });
});

describe("formatHours", () => {
  it("formats positive hours with + sign and padding", () => {
    expect(formatHours(8.5)).toBe("+  8:30");
  });

  it("formats negative hours with - sign", () => {
    expect(formatHours(-2.25)).toBe("-  2:15");
  });

  it("formats zero as positive", () => {
    expect(formatHours(0)).toBe("+  0:00");
  });

  it("formats large numbers", () => {
    expect(formatHours(120)).toBe("+120:00");
  });
});

describe("formatHoursUnsigned", () => {
  it("formats without sign", () => {
    expect(formatHoursUnsigned(8.5)).toBe("  8:30");
  });

  it("formats negative values without sign", () => {
    expect(formatHoursUnsigned(-3.75)).toBe("  3:45");
  });
});

describe("formatHoursCompact", () => {
  it("formats without padding", () => {
    expect(formatHoursCompact(8.5)).toBe("+8:30");
  });

  it("formats negative values", () => {
    expect(formatHoursCompact(-1.5)).toBe("-1:30");
  });

  it("formats zero", () => {
    expect(formatHoursCompact(0)).toBe("+0:00");
  });
});

describe("formatDate", () => {
  it("formats as German locale", () => {
    const date = new Date("2025-03-15");
    const result = formatDate(date);
    expect(result).toMatch(/15\.03\.2025/);
  });
});

describe("calculateReport", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("calculates report for entries", () => {
    vi.useFakeTimers();
    // Set "now" to Friday 2025-01-10 12:00
    vi.setSystemTime(new Date("2025-01-10T12:00:00Z"));

    const entries: ClockifyTimeEntry[] = [
      {
        timeInterval: {
          start: "2025-01-06T08:00:00Z",
          end: "2025-01-06T16:00:00Z", // 8h
        },
      },
      {
        timeInterval: {
          start: "2025-01-07T08:00:00Z",
          end: "2025-01-07T16:00:00Z", // 8h
        },
      },
      {
        timeInterval: {
          start: "2025-01-10T08:00:00Z",
          end: "2025-01-10T12:00:00Z", // 4h (today)
        },
      },
    ];

    const report = calculateReport(entries, 8);

    expect(report.workdays).toBe(5); // Mon-Fri
    expect(report.expectedHours).toBe(40);
    expect(report.actualHours).toBe(20); // 8+8+4
    expect(report.todayHours).toBe(4);
    expect(report.balanceHours).toBe(-20);
  });

  it("handles running timer (end is null)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-06T10:00:00Z"));

    const entries: ClockifyTimeEntry[] = [
      {
        timeInterval: {
          start: "2025-01-06T08:00:00Z",
          end: null, // running since 08:00, now is 10:00 → 2h
        },
      },
    ];

    const report = calculateReport(entries, 8);

    expect(report.actualHours).toBe(2);
    expect(report.todayHours).toBe(2);
  });

  it("returns correct period boundaries", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-10T12:00:00Z"));

    const entries: ClockifyTimeEntry[] = [
      {
        timeInterval: {
          start: "2025-01-06T08:00:00Z",
          end: "2025-01-06T16:00:00Z",
        },
      },
    ];

    const report = calculateReport(entries, 8);

    expect(report.periodStart.toISOString()).toContain("2025-01-06");
    expect(report.periodEnd.toISOString()).toContain("2025-01-10");
  });
});
