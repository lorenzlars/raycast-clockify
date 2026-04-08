import { showHUD } from "@raycast/api";
import { setExtraDaysOff } from "./lib/extraDaysOff";

export default async function Command() {
  await setExtraDaysOff(0);
  await showHUD("Extra Days Off: 0");
}
