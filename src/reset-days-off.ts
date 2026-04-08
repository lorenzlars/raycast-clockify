import { launchCommand, LaunchType } from "@raycast/api";
import { setExtraDaysOff } from "./lib/extraDaysOff";

export default async function Command() {
  await setExtraDaysOff(0);
  await launchCommand({ name: "report", type: LaunchType.UserInitiated });
}
