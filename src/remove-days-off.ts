import { LaunchProps, showHUD } from "@raycast/api";
import { getExtraDaysOff, setExtraDaysOff } from "./lib/extraDaysOff";

export default async function Command(props: LaunchProps<{ arguments: { amount: string } }>) {
  const amount = parseInt(props.arguments.amount) || 1;
  const current = await getExtraDaysOff();
  const updated = Math.max(0, current - amount);
  await setExtraDaysOff(updated);
  await showHUD(`Extra Days Off: ${updated}`);
}
