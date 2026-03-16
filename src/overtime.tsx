import { Action, ActionPanel, Detail, getPreferenceValues, Icon, Color } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { fetchUser, fetchAllTimeEntries } from "./api/clockify";
import { calculateOvertime, formatDate, formatHours, formatHoursUnsigned } from "./lib/calculations";

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

  const markdown = data
    ? `# Clockify Overtime Report

| | |
|---|---|
| **Zeitraum** | ${formatDate(data.periodStart)} – ${formatDate(data.periodEnd)} |
| **Arbeitstage** | ${data.workdays} |
| **Sollstunden** | ${formatHoursUnsigned(data.expectedHours)} |
| **Ist-Stunden** | ${formatHoursUnsigned(data.actualHours)} |
| **Overtime** | **${formatHours(data.overtimeHours)}** |
`
    : isLoading
      ? "Loading..."
      : "No time entries found.";

  const overtimeColor = data && data.overtimeHours >= 0 ? Color.Green : Color.Red;
  const overtimeIcon = data && data.overtimeHours >= 0 ? Icon.ArrowUp : Icon.ArrowDown;

  return (
    <Detail
      isLoading={isLoading}
      markdown={markdown}
      metadata={
        data ? (
          <Detail.Metadata>
            <Detail.Metadata.Label
              title="Zeitraum"
              text={`${formatDate(data.periodStart)} – ${formatDate(data.periodEnd)}`}
            />
            <Detail.Metadata.Label title="Arbeitstage" text={String(data.workdays)} />
            <Detail.Metadata.Separator />
            <Detail.Metadata.Label title="Sollstunden" text={formatHoursUnsigned(data.expectedHours)} />
            <Detail.Metadata.Label title="Ist-Stunden" text={formatHoursUnsigned(data.actualHours)} />
            <Detail.Metadata.Separator />
            <Detail.Metadata.TagList title="Overtime">
              <Detail.Metadata.TagList.Item
                text={formatHours(data.overtimeHours)}
                color={overtimeColor}
                icon={overtimeIcon}
              />
            </Detail.Metadata.TagList>
          </Detail.Metadata>
        ) : null
      }
      actions={
        data ? (
          <ActionPanel>
            <Action.CopyToClipboard
              title="Copy Report"
              content={`Overtime: ${formatHours(data.overtimeHours)} (${formatDate(data.periodStart)} – ${formatDate(data.periodEnd)})`}
            />
            <Action.OpenInBrowser title="Open Clockify" url="https://app.clockify.me" />
          </ActionPanel>
        ) : null
      }
    />
  );
}
