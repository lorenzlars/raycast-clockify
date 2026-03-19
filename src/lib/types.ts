export interface ClockifyUser {
  id: string;
  activeWorkspace: string;
}

export interface ClockifyTimeEntry {
  timeInterval: {
    start: string;
    end: string | null;
  };
}

export interface HoursReport {
  periodStart: Date;
  periodEnd: Date;
  workdays: number;
  expectedHours: number;
  actualHours: number;
  balanceHours: number;
  todayHours: number;
}
