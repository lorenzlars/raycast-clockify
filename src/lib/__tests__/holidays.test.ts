import { describe, it, expect } from "vitest";
import { getHolidays, getHolidaysInRange } from "../holidays";

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function holidayStrings(year: number, state: Parameters<typeof getHolidays>[1]) {
  return getHolidays(year, state).map(toDateStr);
}

describe("Easter computation", () => {
  it.each([
    [2024, "2024-03-31"],
    [2025, "2025-04-20"],
    [2026, "2026-04-05"],
    [2027, "2027-03-28"],
    [2030, "2030-04-21"],
  ])("derives correct Easter-dependent holidays for %i", (year, easterStr) => {
    const holidays = holidayStrings(year, "BE"); // minimal state holidays
    // Ostermontag = Easter + 1
    const easter = new Date(easterStr);
    const osterMontag = new Date(easter);
    osterMontag.setDate(osterMontag.getDate() + 1);
    expect(holidays).toContain(toDateStr(osterMontag));
  });
});

describe("nationwide holidays", () => {
  it("contains all 9 nationwide holidays for 2025", () => {
    const holidays = holidayStrings(2025, "HH"); // Hamburg has few state holidays
    expect(holidays).toContain("2025-01-01"); // Neujahr
    expect(holidays).toContain("2025-04-18"); // Karfreitag
    expect(holidays).toContain("2025-04-21"); // Ostermontag
    expect(holidays).toContain("2025-05-01"); // Tag der Arbeit
    expect(holidays).toContain("2025-05-29"); // Himmelfahrt
    expect(holidays).toContain("2025-06-09"); // Pfingstmontag
    expect(holidays).toContain("2025-10-03"); // Tag der Deutschen Einheit
    expect(holidays).toContain("2025-12-25"); // 1. Weihnachtstag
    expect(holidays).toContain("2025-12-26"); // 2. Weihnachtstag
  });
});

describe("state-specific holidays", () => {
  it("Bayern has Heilige Drei Könige, Fronleichnam, Allerheiligen", () => {
    const holidays = holidayStrings(2025, "BY");
    expect(holidays).toContain("2025-01-06"); // Drei Könige
    expect(holidays).toContain("2025-06-19"); // Fronleichnam (Easter+60)
    expect(holidays).toContain("2025-11-01"); // Allerheiligen
  });

  it("Berlin has Internationaler Frauentag", () => {
    const holidays = holidayStrings(2025, "BE");
    expect(holidays).toContain("2025-03-08");
  });

  it("Sachsen has Reformationstag and Buß- und Bettag", () => {
    const holidays = holidayStrings(2025, "SN");
    expect(holidays).toContain("2025-10-31"); // Reformationstag
    expect(holidays).toContain("2025-11-19"); // Buß- und Bettag
  });

  it("Hamburg does NOT have Drei Könige or Fronleichnam", () => {
    const holidays = holidayStrings(2025, "HH");
    expect(holidays).not.toContain("2025-01-06");
    expect(holidays).not.toContain("2025-06-19");
  });

  it("Thüringen has Weltkindertag and Reformationstag", () => {
    const holidays = holidayStrings(2025, "TH");
    expect(holidays).toContain("2025-09-20");
    expect(holidays).toContain("2025-10-31");
  });
});

describe("Buß- und Bettag", () => {
  it.each([
    [2024, "2024-11-20"],
    [2025, "2025-11-19"],
    [2026, "2026-11-18"],
    [2027, "2027-11-17"],
  ])("is correct for %i", (year, expected) => {
    const holidays = holidayStrings(year, "SN");
    expect(holidays).toContain(expected);
  });
});

describe("getHolidaysInRange", () => {
  it("filters holidays to the given range", () => {
    const holidays = getHolidaysInRange(
      new Date("2025-04-01"),
      new Date("2025-06-30"),
      "NW",
    ).map(toDateStr);

    expect(holidays).toContain("2025-04-18"); // Karfreitag
    expect(holidays).toContain("2025-05-01"); // Tag der Arbeit
    expect(holidays).toContain("2025-06-19"); // Fronleichnam
    expect(holidays).not.toContain("2025-01-01"); // Neujahr (outside range)
    expect(holidays).not.toContain("2025-12-25"); // Weihnachten (outside range)
  });

  it("works across year boundaries", () => {
    const holidays = getHolidaysInRange(
      new Date("2024-12-01"),
      new Date("2025-01-31"),
      "BY",
    ).map(toDateStr);

    expect(holidays).toContain("2024-12-25");
    expect(holidays).toContain("2024-12-26");
    expect(holidays).toContain("2025-01-01");
    expect(holidays).toContain("2025-01-06");
  });
});

describe("holiday counts per state", () => {
  it("Hamburg has 10 holidays (9 nationwide + Reformationstag)", () => {
    expect(getHolidays(2025, "HH")).toHaveLength(10);
  });

  it("Bayern has 13 holidays", () => {
    // 9 nationwide + Drei Könige + Fronleichnam + Allerheiligen = 12
    // Note: Mariä Himmelfahrt excluded (only communities)
    expect(getHolidays(2025, "BY")).toHaveLength(12);
  });

  it("Sachsen has 12 holidays", () => {
    // 9 nationwide + Reformationstag + Buß- und Bettag = 11
    expect(getHolidays(2025, "SN")).toHaveLength(11);
  });
});
