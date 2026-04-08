import { ClockifyUser, ClockifyTimeEntry } from "../lib/types";

const API_BASE = "https://api.clockify.me/api/v1";

async function apiFetch<T>(path: string, apiKey: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "X-Api-Key": apiKey },
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchUser(apiKey: string): Promise<ClockifyUser> {
  return apiFetch<ClockifyUser>("/user", apiKey);
}

export async function fetchAllTimeEntries(
  apiKey: string,
  workspaceId: string,
  userId: string,
): Promise<ClockifyTimeEntry[]> {
  const entries: ClockifyTimeEntry[] = [];
  const pageSize = 5000;
  let page = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const batch = await apiFetch<ClockifyTimeEntry[]>(
      `/workspaces/${workspaceId}/user/${userId}/time-entries?page-size=${pageSize}&page=${page}`,
      apiKey,
    );
    entries.push(...batch);
    if (batch.length < pageSize) break;
    page++;
  }

  return entries;
}
