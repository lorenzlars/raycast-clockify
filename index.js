require("dotenv").config();

const API_BASE = "https://api.clockify.me/api/v1";
const API_KEY = process.env.CLOCKIFY_API_KEY;

if (!API_KEY) {
  console.error("Error: Set CLOCKIFY_API_KEY in .env");
  process.exit(1);
}

const headers = { "X-Api-Key": API_KEY };

async function apiFetch(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

async function getAllTimeEntries(workspaceId, userId) {
  const entries = [];
  const pageSize = 50;
  let page = 1;

  while (true) {
    const batch = await apiFetch(
      `/workspaces/${workspaceId}/user/${userId}/time-entries?page-size=${pageSize}&page=${page}`
    );
    entries.push(...batch);
    if (batch.length < pageSize) break;
    page++;
  }

  return entries;
}

function countWorkdays(start, end) {
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

function formatHours(totalHours) {
  const sign = totalHours < 0 ? "-" : "+";
  const abs = Math.abs(totalHours);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  return `${sign}${String(h).padStart(3, " ")}:${String(m).padStart(2, "0")}`;
}

function formatHoursUnsigned(totalHours) {
  const abs = Math.abs(totalHours);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  return `${String(h).padStart(3, " ")}:${String(m).padStart(2, "0")}`;
}

function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

async function main() {
  const user = await apiFetch("/user");
  const workspaceId = user.activeWorkspace;
  const userId = user.id;

  const entries = await getAllTimeEntries(workspaceId, userId);

  if (entries.length === 0) {
    console.log("No time entries found.");
    return;
  }

  let totalMs = 0;
  for (const entry of entries) {
    const start = new Date(entry.timeInterval.start);
    const end = entry.timeInterval.end
      ? new Date(entry.timeInterval.end)
      : new Date();
    totalMs += end - start;
  }
  const actualHours = totalMs / (1000 * 60 * 60);

  const starts = entries.map((e) => new Date(e.timeInterval.start));
  const earliest = new Date(Math.min(...starts));
  const today = new Date();

  const workdays = countWorkdays(earliest, today);
  const expectedHours = workdays * 8;

  const diff = actualHours - expectedHours;

  console.log();
  console.log("Clockify Overtime Calculator");
  console.log("============================");
  console.log(`Period:          ${formatDate(earliest)} – ${formatDate(today)}`);
  console.log(`Workdays:        ${workdays}`);
  console.log(`Expected hours: ${formatHoursUnsigned(expectedHours)}`);
  console.log(`Actual hours:   ${formatHoursUnsigned(actualHours)}`);
  console.log("─────────────────────────────");
  console.log(`Overtime:       ${formatHours(diff)}`);
  console.log();
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
