import {
  Action,
  ActionPanel,
  Detail,
  getPreferenceValues,
  Icon,
  Color,
} from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { fetchUser, fetchAllTimeEntries } from "./api/clockify";
import {
  calculateReport,
  formatDate,
  formatHours,
  formatHoursUnsigned,
} from "./lib/calculations";
import { FederalState } from "./lib/holidays";
import { getExtraDaysOff } from "./lib/extraDaysOff";

interface Preferences {
  apiKey: string;
  hoursPerDay: string;
  federalState: string;
}

export default function Command() {
  const { apiKey, hoursPerDay, federalState } =
    getPreferenceValues<Preferences>();
  const hours = parseFloat(hoursPerDay) || 8;
  const state = federalState
    ? (federalState as FederalState)
    : undefined;

  const { data, isLoading } = usePromise(async () => {
    const user = await fetchUser(apiKey);
    const extra = await getExtraDaysOff();
    const entries = await fetchAllTimeEntries(
      apiKey,
      user.activeWorkspace,
      user.id,
    );
    if (entries.length === 0) return null;
    return calculateReport(entries, hours, state, extra);
  });

  const markdown = data
    ? `| Name | Value |
|---|---|
| **Period** | ${formatDate(data.periodStart)} – ${formatDate(data.periodEnd)} |
| **Workdays** | ${data.workdays} |
| **Holidays** | ${data.holidays} |
| **Days Off** | ${data.extraDaysOff} |
| **Expected** | ${formatHoursUnsigned(data.expectedHours)} |
| **Actual** | ${formatHoursUnsigned(data.actualHours)} |
`
    : isLoading
      ? "Loading..."
      : "No time entries found.";

  const balanceColor = data && data.balanceHours >= 0 ? Color.Green : Color.Red;
  const balanceIcon =
    data && data.balanceHours >= 0 ? Icon.ArrowUp : Icon.ArrowDown;

  return (
    <Detail
      isLoading={isLoading}
      markdown={markdown}
      metadata={
        data ? (
          <Detail.Metadata>
            <Detail.Metadata.Label
              title="Today"
              text={formatHoursUnsigned(data.todayHours)}
            />
            <Detail.Metadata.Separator />
            <Detail.Metadata.TagList title="Balance">
              <Detail.Metadata.TagList.Item
                text={formatHours(data.balanceHours)}
                color={balanceColor}
                icon={balanceIcon}
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
              content={`Balance: ${formatHours(data.balanceHours)} | Today: ${formatHoursUnsigned(data.todayHours)} (${formatDate(data.periodStart)} – ${formatDate(data.periodEnd)})`}
            />
            <Action.OpenInBrowser
              title="Open Clockify"
              url="https://app.clockify.me"
            />
          </ActionPanel>
        ) : null
      }
    />
  );
}
