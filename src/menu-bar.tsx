import { getPreferenceValues, Icon, MenuBarExtra, open } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { fetchUser, fetchAllTimeEntries } from "./api/clockify";
import {
  calculateOvertime,
  formatDate,
  formatHours,
  formatHoursCompact,
  formatHoursUnsigned,
} from "./lib/calculations";

interface Preferences {
  apiKey: string;
  hoursPerDay: string;
}

export default function Command() {
  const { apiKey, hoursPerDay } = getPreferenceValues<Preferences>();
  const hours = parseFloat(hoursPerDay) || 8;

  const { data, isLoading } = usePromise(async () => {
    const user = await fetchUser(apiKey);
    const entries = await fetchAllTimeEntries(apiKey, user.activeWorkspace, user.id);
    if (entries.length === 0) return null;
    return calculateOvertime(entries, hours);
  });

  const title = data ? formatHoursCompact(data.overtimeHours) : undefined;

  return (
    <MenuBarExtra icon={Icon.Clock} title={title} isLoading={isLoading}>
      {data ? (
        <>
          <MenuBarExtra.Item
            title={`Zeitraum: ${formatDate(data.periodStart)} – ${formatDate(data.periodEnd)}`}
          />
          <MenuBarExtra.Item title={`Arbeitstage: ${data.workdays}`} />
          <MenuBarExtra.Separator />
          <MenuBarExtra.Item title={`Sollstunden: ${formatHoursUnsigned(data.expectedHours)}`} />
          <MenuBarExtra.Item title={`Ist-Stunden: ${formatHoursUnsigned(data.actualHours)}`} />
          <MenuBarExtra.Separator />
          <MenuBarExtra.Item title={`Overtime: ${formatHours(data.overtimeHours)}`} />
          <MenuBarExtra.Separator />
          <MenuBarExtra.Item title="Open Clockify" onAction={() => open("https://app.clockify.me")} />
        </>
      ) : (
        <MenuBarExtra.Item title="No time entries found" />
      )}
    </MenuBarExtra>
  );
}
