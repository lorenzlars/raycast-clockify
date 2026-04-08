export type FederalState =
  | "BW"
  | "BY"
  | "BE"
  | "BB"
  | "HB"
  | "HH"
  | "HE"
  | "MV"
  | "NI"
  | "NW"
  | "RP"
  | "SL"
  | "SN"
  | "ST"
  | "SH"
  | "TH";

function computeEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function bussUndBettag(year: number): Date {
  const nov27 = new Date(year, 10, 27);
  const dow = nov27.getDay();
  const daysToSunday = (7 - dow) % 7;
  const firstAdvent = new Date(year, 10, 27 + daysToSunday);
  return new Date(year, firstAdvent.getMonth(), firstAdvent.getDate() - 11);
}

function getNationwideHolidays(year: number): Date[] {
  const easter = computeEasterSunday(year);
  return [
    new Date(year, 0, 1), // Neujahr
    addDays(easter, -2), // Karfreitag
    addDays(easter, 1), // Ostermontag
    new Date(year, 4, 1), // Tag der Arbeit
    addDays(easter, 39), // Christi Himmelfahrt
    addDays(easter, 50), // Pfingstmontag
    new Date(year, 9, 3), // Tag der Deutschen Einheit
    new Date(year, 11, 25), // 1. Weihnachtstag
    new Date(year, 11, 26), // 2. Weihnachtstag
  ];
}

const STATE_HOLIDAYS: Record<string, FederalState[]> = {
  "01-06": ["BW", "BY", "ST"], // Heilige Drei Könige
  "03-08": ["BE", "MV"], // Internationaler Frauentag
  "08-15": ["SL"], // Mariä Himmelfahrt
  "09-20": ["TH"], // Weltkindertag
  "10-31": ["BB", "HB", "HH", "MV", "NI", "SN", "ST", "SH", "TH"], // Reformationstag
  "11-01": ["BW", "BY", "NW", "RP", "SL"], // Allerheiligen
};

const FRONLEICHNAM_STATES: FederalState[] = [
  "BW",
  "BY",
  "HE",
  "NW",
  "RP",
  "SL",
];

function getStateHolidays(year: number, state: FederalState): Date[] {
  const holidays: Date[] = [];
  const easter = computeEasterSunday(year);

  for (const [mmdd, states] of Object.entries(STATE_HOLIDAYS)) {
    if (states.includes(state)) {
      const [month, day] = mmdd.split("-").map(Number);
      holidays.push(new Date(year, month - 1, day));
    }
  }

  if (FRONLEICHNAM_STATES.includes(state)) {
    holidays.push(addDays(easter, 60)); // Fronleichnam
  }

  if (state === "SN") {
    holidays.push(bussUndBettag(year)); // Buß- und Bettag
  }

  return holidays;
}

function normalizeDate(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function getHolidays(year: number, state: FederalState): Date[] {
  const all = [
    ...getNationwideHolidays(year),
    ...getStateHolidays(year, state),
  ];
  const seen = new Set<number>();
  return all
    .filter((d) => {
      const key = normalizeDate(d);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.getTime() - b.getTime());
}

export function getHolidaysInRange(
  start: Date,
  end: Date,
  state: FederalState,
): Date[] {
  const startNorm = new Date(start);
  startNorm.setHours(0, 0, 0, 0);
  const endNorm = new Date(end);
  endNorm.setHours(0, 0, 0, 0);

  const holidays: Date[] = [];
  for (let year = startNorm.getFullYear(); year <= endNorm.getFullYear(); year++) {
    for (const h of getHolidays(year, state)) {
      const norm = normalizeDate(h);
      if (norm >= startNorm.getTime() && norm <= endNorm.getTime()) {
        holidays.push(h);
      }
    }
  }
  return holidays;
}
